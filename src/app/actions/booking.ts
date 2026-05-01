'use server';

import { prisma } from '@/lib/prisma';

function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

export async function createAppointment(data: {
  companyId: string;
  professionalId: string;
  serviceIds: string[];
  dateStr: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  customerName: string;
  customerWhatsapp: string;
}) {
  const date = new Date(`${data.dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) throw new Error('Data inválida');
  if (!data.startTime) throw new Error('Horário inválido');
  if (!data.customerName?.trim()) throw new Error('Nome é obrigatório');
  if (!data.customerWhatsapp?.trim()) throw new Error('WhatsApp é obrigatório');
  if (!data.serviceIds?.length) throw new Error('Selecione ao menos 1 serviço');

  const company = await prisma.company.findUnique({
    where: { id: data.companyId },
    select: { id: true, status: true },
  });
  if (!company || company.status !== 'ACTIVE') throw new Error('Empresa indisponível');

  const professional = await prisma.professional.findFirst({
    where: { id: data.professionalId, companyId: data.companyId, status: 'ACTIVE' },
    select: { id: true },
  });
  if (!professional) throw new Error('Profissional inválido');
  
  // Buscar todos os serviços selecionados
  const services: Array<{ id: string; name: string; durationMinutes: number; price: number }> =
    await prisma.service.findMany({
      where: { id: { in: data.serviceIds }, companyId: data.companyId, status: 'ACTIVE' },
      select: { id: true, name: true, durationMinutes: true, price: true },
    });
  if (services.length !== data.serviceIds.length) throw new Error('Serviço inválido');
  
  const totalDuration = services.reduce((acc: number, curr) => acc + curr.durationMinutes, 0);
  const totalPrice = services.reduce((acc: number, curr) => acc + curr.price, 0);
  const serviceNames = services.map(s => s.name).join(' + ');
  const endMinutes = timeToMinutes(data.startTime) + totalDuration;
  const endTime = minutesToTime(endMinutes);

  // Validar disponibilidade e conflitos (server-side)
  const dayOfWeek = date.getDay();
  const availability = await prisma.availability.findFirst({
    where: { professionalId: data.professionalId, dayOfWeek, status: 'ACTIVE' },
  });
  if (!availability) throw new Error('Sem disponibilidade neste dia');

  const startMin = timeToMinutes(data.startTime);
  const endMin = timeToMinutes(endTime);
  const availStart = timeToMinutes(availability.startTime);
  const availEnd = timeToMinutes(availability.endTime);
  if (startMin < availStart || endMin > availEnd) throw new Error('Fora do horário de atendimento');

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const blockedTimes = await prisma.blockedTime.findMany({
    where: { professionalId: data.professionalId, date: { gte: startOfDay, lte: endOfDay } },
  });
  for (const block of blockedTimes) {
    const bStart = timeToMinutes(block.startTime);
    const bEnd = timeToMinutes(block.endTime);
    if (startMin < bEnd && bStart < endMin) throw new Error('Horário indisponível (bloqueado)');
  }

  const existing = await prisma.appointment.findMany({
    where: {
      professionalId: data.professionalId,
      date: { gte: startOfDay, lte: endOfDay },
      status: { notIn: ['CANCELLED', 'NO_SHOW'] },
    },
    select: { startTime: true, endTime: true },
  });
  for (const appt of existing) {
    const aStart = timeToMinutes(appt.startTime);
    const aEnd = timeToMinutes(appt.endTime);
    if (startMin < aEnd && aStart < endMin) throw new Error('Horário já ocupado');
  }

  // 1. Criar ou encontrar cliente — se já existe, atualiza o nome
  let customer = await prisma.customer.findFirst({
    where: { companyId: data.companyId, whatsapp: data.customerWhatsapp }
  });

  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        companyId: data.companyId,
        name: data.customerName,
        whatsapp: data.customerWhatsapp
      }
    });
  } else if (customer.name !== data.customerName) {
    // Atualiza o nome caso o cliente tenha informado um diferente
    customer = await prisma.customer.update({
      where: { id: customer.id },
      data: { name: data.customerName }
    });
  }

  // 2. Criar UM ÚNICO agendamento com o combo completo de serviços
  // O serviceId armazena o primeiro serviço (para compatibilidade com o schema)
  // serviceNames armazena o combo legível (ex: "Corte de Cabelo + Barba Completa")
  await prisma.appointment.create({
    data: {
      companyId: data.companyId,
      customerId: customer.id,
      professionalId: data.professionalId,
      serviceId: services[0]!.id,
      serviceNames,
      totalPrice,
      date,
      startTime: data.startTime,
      endTime,
      status: 'CONFIRMED'
    }
  });

  return { success: true };
}
