'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function createBlockedTime(data: {
  companyId: string;
  professionalId: string;
  dateStr: string;
  startTime: string;
  endTime: string;
  reason?: string;
}) {
  const date = new Date(`${data.dateStr}T00:00:00`);

  await prisma.blockedTime.create({
    data: {
      companyId: data.companyId,
      professionalId: data.professionalId,
      date,
      startTime: data.startTime,
      endTime: data.endTime,
      reason: data.reason || null
    }
  });

  revalidatePath(`/app/profissionais/${data.professionalId}/horarios`);
  return { success: true };
}

export async function deleteBlockedTime(id: string, professionalId: string) {
  await prisma.blockedTime.delete({
    where: { id }
  });

  revalidatePath(`/app/profissionais/${professionalId}/horarios`);
  return { success: true };
}

export async function getBlockedTimes(professionalId: string) {
  return prisma.blockedTime.findMany({
    where: { professionalId },
    orderBy: [
      { date: 'asc' },
      { startTime: 'asc' }
    ]
  });
}
