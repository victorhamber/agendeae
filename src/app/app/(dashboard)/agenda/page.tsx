import styles from '../../app.module.css';
import AgendaFilter from './AgendaFilter';
import AgendaTable from './AgendaTable';
import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { requireCompanySession } from '@/lib/auth/server';
import type { Prisma } from '@prisma/client';
import { DateTime } from 'luxon';
import { safeTz } from '@/lib/datetime';

function getDateRange(tz: string, filtro: string, de?: string, ate?: string) {
  const nowTz = DateTime.now().setZone(tz);
  const today = nowTz.startOf('day');

  switch (filtro) {
    case 'hoje': {
      const tomorrow = today.plus({ days: 1 });
      return { gte: today.toUTC().toJSDate(), lt: tomorrow.toUTC().toJSDate(), label: 'Hoje' };
    }
    case 'amanha': {
      const tomorrow = today.plus({ days: 1 });
      const dayAfter = today.plus({ days: 2 });
      return { gte: tomorrow.toUTC().toJSDate(), lt: dayAfter.toUTC().toJSDate(), label: 'Amanhã' };
    }
    case 'semana': {
      // Mantém semana iniciando no Domingo (0)
      const dayOfWeek = today.weekday % 7; // Luxon: 1=Mon..7=Sun
      const startOfWeek = today.minus({ days: dayOfWeek });
      const endOfWeek = startOfWeek.plus({ days: 7 });
      return { gte: startOfWeek.toUTC().toJSDate(), lt: endOfWeek.toUTC().toJSDate(), label: 'Esta Semana' };
    }
    case 'mes': {
      const startOfMonth = today.startOf('month');
      const endOfMonth = startOfMonth.plus({ months: 1 });
      return { gte: startOfMonth.toUTC().toJSDate(), lt: endOfMonth.toUTC().toJSDate(), label: 'Este Mês' };
    }
    case 'custom': {
      if (de && ate) {
        const from = DateTime.fromISO(de, { zone: tz }).startOf('day');
        const to = DateTime.fromISO(ate, { zone: tz }).endOf('day');
        return { gte: from.toUTC().toJSDate(), lt: to.toUTC().toJSDate(), label: `${de} a ${ate}` };
      }
      const tomorrow = today.plus({ days: 1 });
      return { gte: today.toUTC().toJSDate(), lt: tomorrow.toUTC().toJSDate(), label: 'Hoje' };
    }
    default: {
      const tomorrow = today.plus({ days: 1 });
      return { gte: today.toUTC().toJSDate(), lt: tomorrow.toUTC().toJSDate(), label: 'Hoje' };
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
  const tz = safeTz(company.timezone);
  const range = getDateRange(tz, filtro, params.de, params.ate);

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

      <AgendaTable
        appointments={appointments}
        showFinancials={session.role === 'COMPANY_ADMIN'}
        companyTimezone={tz}
      />
    </div>
  );
}
