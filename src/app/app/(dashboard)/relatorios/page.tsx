import styles from '../../app.module.css';
import { Suspense } from 'react';
import AgendaFilter from '../agenda/AgendaFilter';
import DeleteAppointmentButton from './DeleteAppointmentButton';
import { prisma } from '@/lib/prisma';
import { requireCompanyAdminSession } from '@/lib/auth/server';
import { splitAppointmentGross } from '@/lib/commission';

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
      const dayOfWeek = today.getDay();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - dayOfWeek);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);
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
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return { gte: today, lt: tomorrow, label: 'Hoje' };
    }
    default: {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      return { gte: startOfMonth, lt: endOfMonth, label: 'Este Mês' };
    }
  }
}

function formatBrl(n: number) {
  return `R$ ${n.toFixed(2).replace('.', ',')}`;
}

export default async function RelatoriosPage({ searchParams }: { searchParams: Promise<{ filtro?: string; de?: string; ate?: string }> }) {
  const params = await searchParams;
  const session = await requireCompanyAdminSession();
  const company = await prisma.company.findUnique({ where: { id: session.companyId } });

  if (!company) {
    return <div>Empresa não encontrada.</div>;
  }

  const filtro = params.filtro || 'mes';
  const range = getDateRange(filtro, params.de, params.ate);

  const professionals = await prisma.professional.findMany({
    where: { companyId: company.id, status: 'ACTIVE' },
  });

  const completedAppointments = await prisma.appointment.findMany({
    where: {
      companyId: company.id,
      status: 'COMPLETED',
      date: { gte: range.gte, lt: range.lt },
    },
    orderBy: [{ date: 'desc' }, { startTime: 'desc' }],
    include: {
      service: true,
      professional: true,
    },
  });

  const reportData = professionals.map(prof => {
    const profAppointments = completedAppointments.filter(app => app.professionalId === prof.id);
    const servicesCount = profAppointments.length;

    let totalGross = 0;
    let totalProfessionalShare = 0;
    let totalCompanyNet = 0;

    for (const app of profAppointments) {
      const gross = app.totalPrice ?? app.service.price;
      totalGross += gross;
      const split = splitAppointmentGross(gross, prof.commissionPercent);
      totalProfessionalShare += split.professionalShare;
      totalCompanyNet += split.companyNet;
    }

    const ratedAppointments = profAppointments.filter(app => app.rating !== null);
    const ratingSum = ratedAppointments.reduce((acc, curr) => acc + (curr.rating || 0), 0);
    const calculatedRating =
      ratedAppointments.length > 0 ? ratingSum / ratedAppointments.length : prof.ratingAverage || 5.0;

    return {
      ...prof,
      totalGross,
      totalProfessionalShare,
      totalCompanyNet,
      servicesCount,
      calculatedRating,
      appointments: profAppointments,
    };
  });

  return (
    <div>
      <header className={styles.header}>
        <h1 className={styles.title}>Relatórios de Atendimentos</h1>
        <p className={styles.relatorioHeaderDesc}>
          Valores com reparte conforme o percentual configurado em cada profissional. Somente administradores veem esta página.
        </p>
      </header>

      <Suspense fallback={<div>Carregando filtros...</div>}>
        <AgendaFilter />
      </Suspense>

      <div className={styles.relatorioStack}>
        {reportData.map(data => (
          <div key={data.id} className={`glass ${styles.relatorioCard}`}>
            <div className={styles.relatorioCardHeader}>
              <div className={styles.relatorioProfAvatar}>
                {data.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={data.photoUrl} alt="" className={styles.relatorioProfAvatarImg} />
                ) : null}
              </div>
              <div>
                <h2 className={styles.relatorioName}>{data.name}</h2>
                <p className={styles.relatorioSpecialty}>{data.specialty}</p>
                <p className={styles.relatorioCommissionHint}>
                  Repasse configurado: {data.commissionPercent.toFixed(0)}% do valor bruto por atendimento
                </p>
              </div>
              <div className={styles.relatorioRatingBlock}>
                <p className={styles.relatorioRatingValue}>★ {data.calculatedRating.toFixed(1)}</p>
                <p className={styles.relatorioRatingLabel}>Avaliação média</p>
              </div>
            </div>

            <div className={styles.agendaStatsGrid}>
              <div className={styles.agendaStatCard}>
                <p className={styles.agendaStatLabel}>Atendimentos</p>
                <p className={styles.agendaStatValue}>{data.servicesCount}</p>
              </div>
              <div className={styles.agendaStatCard}>
                <p className={styles.agendaStatLabel}>Valor bruto</p>
                <p className={`${styles.relatorioKpiValue} ${styles.agendaStatValueSuccess}`}>{formatBrl(data.totalGross)}</p>
              </div>
              <div className={styles.agendaStatCard}>
                <p className={styles.agendaStatLabel}>Repasse ao profissional</p>
                <p className={`${styles.relatorioKpiValue} ${styles.agendaStatValuePrimary}`}>
                  {formatBrl(data.totalProfessionalShare)}
                </p>
              </div>
              <div className={styles.agendaStatCard}>
                <p className={styles.agendaStatLabel}>Líquido empresa (após repasse)</p>
                <p className={styles.relatorioKpiValue}>{formatBrl(data.totalCompanyNet)}</p>
              </div>
            </div>

            {data.appointments.length > 0 ? (
              <div className={`table-responsive ${styles.relatorioTableScroll}`}>
                <table className={styles.relatorioTable}>
                  <thead>
                    <tr className={styles.relatorioTheadRow}>
                      <th className={styles.relatorioTh}>Data</th>
                      <th className={styles.relatorioTh}>Serviço(s)</th>
                      <th className={styles.relatorioTh}>Valor bruto</th>
                      <th className={styles.relatorioTh}>Repasse prof.</th>
                      <th className={styles.relatorioTh}>Líquido empresa</th>
                      <th className={styles.relatorioTh}>Avaliação</th>
                      <th className={styles.relatorioThRight}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.appointments.map(app => {
                      const gross = app.totalPrice ?? app.service.price;
                      const split = splitAppointmentGross(gross, data.commissionPercent);
                      return (
                        <tr key={app.id} className={styles.relatorioTbodyRow}>
                          <td className={styles.relatorioTd}>
                            {app.date.toLocaleDateString('pt-BR')} às {app.startTime}
                          </td>
                          <td className={styles.relatorioTd}>{app.serviceNames || app.service.name}</td>
                          <td className={styles.relatorioTd}>{formatBrl(split.gross)}</td>
                          <td className={`${styles.relatorioTd} ${styles.relatorioTdRepasse}`}>
                            {formatBrl(split.professionalShare)}
                          </td>
                          <td className={styles.relatorioTd}>{formatBrl(split.companyNet)}</td>
                          <td className={`${styles.relatorioTd} ${styles.relatorioTdRating}`}>
                            {app.rating ? `★ ${app.rating.toFixed(1)}` : 'S/ avaliação'}
                          </td>
                          <td className={`${styles.relatorioTd} ${styles.relatorioTdRight}`}>
                            <DeleteAppointmentButton id={app.id} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className={styles.relatorioEmpty}>Nenhum atendimento concluído neste período.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
