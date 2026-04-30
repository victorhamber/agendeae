'use server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
  
  // Buscar todos os serviços selecionados
  const services = await prisma.service.findMany({
    where: { id: { in: data.serviceIds } }
  });
  
  const totalDuration = services.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const totalPrice = services.reduce((acc, curr) => acc + curr.price, 0);
  const serviceNames = services.map(s => s.name).join(' + ');
  const endMinutes = timeToMinutes(data.startTime) + totalDuration;
  const endTime = minutesToTime(endMinutes);

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
      serviceId: services[0].id,
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
