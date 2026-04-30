'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function updateAppointmentStatus(id: string, newStatus: string) {
  await prisma.appointment.update({
    where: { id },
    data: { status: newStatus }
  });

  revalidatePath('/app/agenda');
  revalidatePath('/app');
  return { success: true };
}

export async function deleteAppointment(id: string) {
  await prisma.appointment.delete({
    where: { id }
  });

  revalidatePath('/app/relatorios');
  revalidatePath('/app/agenda');
  revalidatePath('/app');
  return { success: true };
}

export async function findCustomerAppointments(companySlug: string, phone: string) {
  const company = await prisma.company.findUnique({ where: { slug: companySlug } });
  if (!company) throw new Error("Empresa não encontrada.");

  const cleanPhone = phone.replace(/\D/g, '');

  const appointments = await prisma.appointment.findMany({
    where: {
      companyId: company.id,
      customer: {
        whatsapp: cleanPhone
      }
    },
    include: {
      service: true,
      professional: true
    },
    orderBy: [
      { date: 'desc' },
      { startTime: 'desc' }
    ]
  });

  return appointments;
}
