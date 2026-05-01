'use server';

import { prisma } from '@/lib/prisma';
import { requireCompanySession } from '@/lib/auth/server';

export type AvailabilityData = {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakStartTime: string | null;
  breakEndTime: string | null;
  isActive: boolean;
};

export async function saveAvailability(professionalId: string, availabilities: AvailabilityData[]) {
  const session = await requireCompanySession();
  const prof = await prisma.professional.findUnique({ where: { id: professionalId }, select: { companyId: true } });
  if (!prof || prof.companyId !== session.companyId) throw new Error('Sem permissão');
  // Use a transaction to update all days
  await prisma.$transaction(
    availabilities.map((av) => {
      if (av.id) {
        return prisma.availability.update({
          where: { id: av.id },
          data: {
            startTime: av.startTime,
            endTime: av.endTime,
            breakStartTime: av.breakStartTime || null,
            breakEndTime: av.breakEndTime || null,
            status: av.isActive ? 'ACTIVE' : 'INACTIVE'
          }
        });
      } else {
        return prisma.availability.create({
          data: {
            companyId: session.companyId,
            professionalId,
            dayOfWeek: av.dayOfWeek,
            startTime: av.startTime,
            endTime: av.endTime,
            breakStartTime: av.breakStartTime || null,
            breakEndTime: av.breakEndTime || null,
            status: av.isActive ? 'ACTIVE' : 'INACTIVE'
          }
        });
      }
    })
  );

  return { success: true };
}
