'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireCompanySession } from '@/lib/auth/server';

export async function createService(data: { 
  name: string; 
  price: number; 
  durationMinutes: number;
  description?: string;
  imageUrl?: string;
}) {
  const session = await requireCompanySession();
  await prisma.service.create({
    data: {
      companyId: session.companyId,
      name: data.name,
      price: data.price,
      durationMinutes: data.durationMinutes,
      description: data.description || null,
      imageUrl: data.imageUrl || null,
      status: 'ACTIVE'
    }
  });

  revalidatePath('/app/servicos');
  return { success: true };
}

export async function deleteService(id: string) {
  const session = await requireCompanySession();
  // Soft delete para não quebrar histórico de agendamentos
  const service = await prisma.service.findUnique({ where: { id }, select: { companyId: true } });
  if (!service || service.companyId !== session.companyId) throw new Error('Sem permissão');
  await prisma.service.update({
    where: { id },
    data: { status: 'INACTIVE' }
  });

  revalidatePath('/app/servicos');
  return { success: true };
}

export async function updateService(id: string, data: { 
  name: string; 
  price: number; 
  durationMinutes: number;
  description?: string;
  imageUrl?: string;
}) {
  const session = await requireCompanySession();
  const service = await prisma.service.findUnique({ where: { id }, select: { companyId: true } });
  if (!service || service.companyId !== session.companyId) throw new Error('Sem permissão');
  await prisma.service.update({
    where: { id },
    data: {
      name: data.name,
      price: data.price,
      durationMinutes: data.durationMinutes,
      description: data.description ?? undefined,
      imageUrl: data.imageUrl ?? undefined,
    }
  });

  revalidatePath('/app/servicos');
  return { success: true };
}
