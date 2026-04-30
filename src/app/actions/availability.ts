'use server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
  const date = new Date(`${dateStr}T00:00:00`);
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // 1. Fetch Availability config for this day
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

  // 2. Fetch existing appointments for this date
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const appointments = await prisma.appointment.findMany({
    where: {
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
      professionalId,
      date: {
        gte: startOfDay,
        lte: endOfDay
      }
    }
  });

  // 4. Calculate minimum time — prevent booking in the past or too close
  const now = new Date();
  const MIN_ADVANCE_MINUTES = 60; // 1 hora de antecedência mínima
  const isToday = date.toDateString() === now.toDateString();
  const currentMinOfDay = isToday ? (now.getHours() * 60 + now.getMinutes() + MIN_ADVANCE_MINUTES) : 0;

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

