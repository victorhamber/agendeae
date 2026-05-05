'use server';

/**
 * Agenda pública: URL `/{slug}` → `Company` → `BookingFlow` recebe `companyId` + profissionais da empresa.
 * Horários livres: `getAvailableTimeSlots(profId, …)` resolve o `companyId` do profissional e filtra
 * conflitos também por `companyId` (defesa em profundidade; `professionalId` já é único no sistema).
 */
import { prisma } from '@/lib/prisma';
import { safeTz, ymdToDayOfWeek, ymdToUtcRange } from '@/lib/datetime';
import { DateTime } from 'luxon';

function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

function doTimeRangesOverlap(start1: number, end1: number, start2: number, end2: number): boolean {
  return start1 < end2 && start2 < end1;
}

export async function getAvailableTimeSlots(
  professionalId: string,
  dateStr: string, // YYYY-MM-DD
  totalDurationMinutes: number
) {
  // 1. Fetch Availability config for this day
  const professional = await prisma.professional.findUnique({
    where: { id: professionalId },
    select: { id: true, companyId: true, company: { select: { timezone: true } } },
  });

  if (!professional) {
    return [];
  }

  const tz = safeTz(professional.company.timezone);
  const dayOfWeek = ymdToDayOfWeek(dateStr, tz); // 0=Sunday..6=Saturday
  const { startUtc: startOfDay, endUtc: endOfDay } = ymdToUtcRange(dateStr, tz);

  const availability = await prisma.availability.findFirst({
    where: {
      professionalId,
      dayOfWeek,
      status: 'ACTIVE'
    }
  });

  if (!availability) {
    return []; // Not working on this day
  }

  const companyId = professional.companyId;

  const appointments = await prisma.appointment.findMany({
    where: {
      companyId,
      professionalId,
      date: {
        gte: startOfDay,
        lte: endOfDay
      },
      status: {
        notIn: ['CANCELLED', 'NO_SHOW']
      }
    }
  });

  // 3. Fetch blocked times for this date (folgas, feriados, etc.)
  const blockedTimes = await prisma.blockedTime.findMany({
    where: {
      companyId,
      professionalId,
      date: {
        gte: startOfDay,
        lte: endOfDay
      }
    }
  });

  // 4. Calculate minimum time — prevent booking in the past or too close
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: { bookingRules: true }
  });
  
  const rules = company?.bookingRules;
  const minAdvanceHours = rules?.minAdvanceHours ?? 1;
  const maxAdvanceDays = rules?.maxAdvanceDays ?? 60;

  const nowTz = DateTime.now().setZone(tz);
  const dateTz = DateTime.fromISO(dateStr, { zone: tz }).startOf('day');

  // Verify max advance days (no timezone da empresa)
  const maxDateTz = nowTz.plus({ days: maxAdvanceDays }).endOf('day');
  if (dateTz > maxDateTz) return []; // Beyond max advance limit

  const MIN_ADVANCE_MINUTES = minAdvanceHours * 60;
  const isToday = dateTz.hasSame(nowTz, 'day');
  const currentMinOfDay = isToday ? (nowTz.hour * 60 + nowTz.minute + MIN_ADVANCE_MINUTES) : 0;

  // 5. Generate possible slots
  const slots: string[] = [];
  const startMin = timeToMinutes(availability.startTime);
  const endMin = timeToMinutes(availability.endTime);
  const breakStartMin = availability.breakStartTime ? timeToMinutes(availability.breakStartTime) : null;
  const breakEndMin = availability.breakEndTime ? timeToMinutes(availability.breakEndTime) : null;

  const INTERVAL = 30; // 30 minutes grid

  for (let currentMin = startMin; currentMin + totalDurationMinutes <= endMin; currentMin += INTERVAL) {
    const slotStartMin = currentMin;
    const slotEndMin = currentMin + totalDurationMinutes;

    // Skip past/too-close slots
    if (slotStartMin < currentMinOfDay) {
      continue;
    }

    let hasConflict = false;

    // Check lunch break conflict
    if (breakStartMin !== null && breakEndMin !== null) {
      if (doTimeRangesOverlap(slotStartMin, slotEndMin, breakStartMin, breakEndMin)) {
        hasConflict = true;
      }
    }

    // Check blocked times conflict (folga, feriado, etc.)
    if (!hasConflict) {
      for (const block of blockedTimes) {
        const blockStartMin = timeToMinutes(block.startTime);
        const blockEndMin = timeToMinutes(block.endTime);
        if (doTimeRangesOverlap(slotStartMin, slotEndMin, blockStartMin, blockEndMin)) {
          hasConflict = true;
          break;
        }
      }
    }

    // Check appointments conflict
    if (!hasConflict) {
      for (const appt of appointments) {
        const apptStartMin = timeToMinutes(appt.startTime);
        const apptEndMin = timeToMinutes(appt.endTime);
        if (doTimeRangesOverlap(slotStartMin, slotEndMin, apptStartMin, apptEndMin)) {
          hasConflict = true;
          break;
        }
      }
    }

    if (!hasConflict) {
      slots.push(minutesToTime(slotStartMin));
    }
  }

  return slots;
}

