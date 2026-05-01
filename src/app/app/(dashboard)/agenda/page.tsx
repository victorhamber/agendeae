import styles from '../../app.module.css';
import AgendaFilter from './AgendaFilter';
import AgendaTable from './AgendaTable';
import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { requireCompanySession } from '@/lib/auth/server';
import type { Prisma } from '@prisma/client';

function getDateRange(filtro: string, de?: string, ate?: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  switch (filtro) {
    case 'hoje': {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return { gte: today, lt: tomorrow, label: 'Hoje' };
    }
    case 'amanha': {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfter = new Date(today);
      dayAfter.setDate(dayAfter.getDate() + 2);
      return { gte: tomorrow, lt: dayAfter, label: 'Amanhã' };
    }
    case 'semana': {
      const dayOfWeek = today.getDay(); // 0 = Sunday
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - dayOfWeek); // Sunday
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7); // Next Sunday
      return { gte: startOfWeek, lt: endOfWeek, label: 'Esta Semana' };
    }
    case 'mes': {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      return { gte: startOfMonth, lt: endOfMonth, label: 'Este Mês' };
    }
    case 'custom': {
      if (de && ate) {
        const from = new Date(`${de}T00:00:00`);
        const to = new Date(`${ate}T23:59:59`);
        return { gte: from, lt: to, label: `${de} a ${ate}` };
      }
      // Fallback to today
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return { gte: today, lt: tomorrow, label: 'Hoje' };
    }
    default: {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return { gte: today, lt: tomorrow, label: 'Hoje' };
    }
  }
}

export default async function AgendaPage({ searchParams }: { searchParams: Promise<{ filtro?: string; de?: string; ate?: string }> }) {
  const params = await searchParams;
  const session = await requireCompanySession();
  const company = await prisma.company.findUnique({ where: { id: session.companyId } });
  
  if (!company) {
    return <div>Empresa não encontrada.</div>;
  }

  const filtro = params.filtro || 'hoje';
  const range = getDateRange(filtro, params.de, params.ate);

  const whereClause: Prisma.AppointmentWhereInput = {
    companyId: company.id,
    date: { gte: range.gte, lt: range.lt }
  };

  // Se for profissional logado, restringe apenas aos seus agendamentos
  if (session.role === 'PROFESSIONAL' && session.professionalId) {
    whereClause.professionalId = session.professionalId;
  }

  const appointments = await prisma.appointment.findMany({
    where: whereClause,
    orderBy: [
      { date: 'asc' },
      { startTime: 'asc' }
    ],
    include: {
      customer: true,
      service: true,
      professional: true
    }
  });

  return (
    <div>
      <header className={styles.header}>
        <h1 className={styles.title}>Gestão da Agenda</h1>
      </header>

      <Suspense fallback={<div>Carregando filtros...</div>}>
        <AgendaFilter />
      </Suspense>

      <AgendaTable appointments={appointments} />
    </div>
  );
}
