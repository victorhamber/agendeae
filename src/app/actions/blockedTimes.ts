'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireCompanySession } from '@/lib/auth/server';

export async function createBlockedTime(data: {
  professionalId: string;
  dateStr: string;
  startTime: string;
  endTime: string;
  reason?: string;
}) {
  const session = await requireCompanySession();
  if (session.role === 'PROFESSIONAL' && session.professionalId !== data.professionalId) {
    throw new Error('Sem permissão');
  }
  const prof = await prisma.professional.findUnique({ where: { id: data.professionalId }, select: { companyId: true } });
  if (!prof || prof.companyId !== session.companyId) throw new Error('Sem permissão');

  const date = new Date(`${data.dateStr}T00:00:00`);

  await prisma.blockedTime.create({
    data: {
      companyId: session.companyId,
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
  const session = await requireCompanySession();
  if (session.role === 'PROFESSIONAL' && session.professionalId !== professionalId) {
    throw new Error('Sem permissão');
  }
  const bt = await prisma.blockedTime.findUnique({ where: { id }, select: { companyId: true, professionalId: true } });
  if (!bt || bt.companyId !== session.companyId || bt.professionalId !== professionalId) throw new Error('Sem permissão');
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
