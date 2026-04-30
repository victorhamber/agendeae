'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function createService(companyId: string, data: { 
  name: string; 
  price: number; 
  durationMinutes: number;
  description?: string;
  imageUrl?: string;
}) {
  await prisma.service.create({
    data: {
      companyId,
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
  // Soft delete para não quebrar histórico de agendamentos
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
