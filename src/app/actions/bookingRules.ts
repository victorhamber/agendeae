'use server';

import { prisma } from '@/lib/prisma';
import { requireCompanySession } from '@/lib/auth/server';
import { revalidatePath } from 'next/cache';

export async function getBookingRules(companyId: string) {
  return await prisma.bookingRule.findUnique({ where: { companyId } });
}

export async function saveBookingRules(formData: FormData) {
  const session = await requireCompanySession();
  if (session.role !== 'COMPANY_ADMIN') throw new Error('Sem permissão');

  const data = {
    // OBS: apesar do nome no banco, `minAdvanceHours` agora é tratado como MINUTOS (compatibilidade).
    minAdvanceHours: parseInt(String(formData.get('minAdvanceHours') || '60')),
    maxAdvanceDays: parseInt(String(formData.get('maxAdvanceDays') || '60')),
    allowCancellation: formData.get('allowCancellation') === 'on',
    cancellationDeadlineHours: parseInt(String(formData.get('cancellationDeadlineHours') || '6')),
    allowReschedule: formData.get('allowReschedule') === 'on',
    rescheduleDeadlineHours: parseInt(String(formData.get('rescheduleDeadlineHours') || '12')),
    allowAnyProfessional: formData.get('allowAnyProfessional') === 'on',
  };

  await prisma.bookingRule.upsert({
    where: { companyId: session.companyId },
    update: data,
    create: { companyId: session.companyId, ...data },
  });

  revalidatePath('/configuracoes');
  return { success: true };
}

export async function cancelAppointmentByCustomer(appointmentId: string, whatsapp: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { company: { include: { bookingRules: true } } },
  });

  if (!appointment) throw new Error('Agendamento não encontrado');
  if (appointment.status !== 'CONFIRMED' && appointment.status !== 'PENDING') {
    throw new Error('Este agendamento não pode ser cancelado');
  }

  // Verify the customer owns this appointment
  const customer = await prisma.customer.findUnique({ where: { id: appointment.customerId } });
  if (!customer || customer.whatsapp !== whatsapp) {
    throw new Error('Não autorizado');
  }

  const rules = appointment.company.bookingRules;
  if (rules && !rules.allowCancellation) {
    throw new Error('Esta empresa não permite cancelamento online');
  }

  // Check deadline
  if (rules) {
    const appointmentDateTime = new Date(appointment.date);
    const [hours, minutes] = appointment.startTime.split(':').map(Number);
    appointmentDateTime.setHours(hours, minutes, 0, 0);

    const deadlineMs = rules.cancellationDeadlineHours * 60 * 60 * 1000;
    const now = new Date();
    if (appointmentDateTime.getTime() - now.getTime() < deadlineMs) {
      throw new Error(`Cancelamento permitido até ${rules.cancellationDeadlineHours}h antes do horário`);
    }
  }

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: 'CANCELLED', cancellationReason: 'Cancelado pelo cliente' },
  });

  return { success: true };
}
