'use server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type AvailabilityData = {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakStartTime: string | null;
  breakEndTime: string | null;
  isActive: boolean;
};

export async function saveAvailability(companyId: string, professionalId: string, availabilities: AvailabilityData[]) {
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
            companyId,
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
