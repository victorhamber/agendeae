'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireCompanySession } from '@/lib/auth/server';

export async function updateAppointmentStatus(id: string, newStatus: string) {
  const session = await requireCompanySession();
  const appt = await prisma.appointment.findUnique({ where: { id }, select: { companyId: true, professionalId: true } });
  if (!appt || appt.companyId !== session.companyId) throw new Error('Sem permissão');
  if (session.role === 'PROFESSIONAL' && session.professionalId !== appt.professionalId) throw new Error('Sem permissão');

  await prisma.appointment.update({
    where: { id },
    data: { status: newStatus }
  });

  revalidatePath('/app/agenda');
  revalidatePath('/app');
  return { success: true };
}

export async function deleteAppointment(id: string) {
  const session = await requireCompanySession();
  const appt = await prisma.appointment.findUnique({ where: { id }, select: { companyId: true, professionalId: true } });
  if (!appt || appt.companyId !== session.companyId) throw new Error('Sem permissão');
  if (session.role === 'PROFESSIONAL' && session.professionalId !== appt.professionalId) throw new Error('Sem permissão');

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
