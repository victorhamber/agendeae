import { PrismaClient } from '@prisma/client';
import styles from '../../app.module.css';
import { Suspense } from 'react';
import AgendaFilter from '../agenda/AgendaFilter';
import DeleteAppointmentButton from './DeleteAppointmentButton';

const prisma = new PrismaClient();

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
      return { gte: startOfMonth, lt: endOfMonth, label: 'Este Mês' }; // Default para relatórios costuma ser Mês
    }
  }
}

export default async function RelatoriosPage({ searchParams }: { searchParams: Promise<{ filtro?: string; de?: string; ate?: string }> }) {
  const params = await searchParams;
  const company = await prisma.company.findFirst();
  
  if (!company) {
    return <div>Empresa não encontrada.</div>;
  }

  // Se não tem filtro na URL, o padrão do relatório será 'mes'
  const filtro = params.filtro || 'mes';
  const range = getDateRange(filtro, params.de, params.ate);

  // Buscar todos os profissionais ativos
  const professionals = await prisma.professional.findMany({
    where: { companyId: company.id, status: 'ACTIVE' }
  });

  // Buscar atendimentos concluídos no período
  const completedAppointments = await prisma.appointment.findMany({
    where: {
      companyId: company.id,
      status: 'COMPLETED',
      date: { gte: range.gte, lt: range.lt }
    },
    orderBy: [
      { date: 'desc' },
      { startTime: 'desc' }
    ],
    include: {
      service: true,
      professional: true
    }
  });

  // Agrupar os dados por profissional
  const reportData = professionals.map(prof => {
    const profAppointments = completedAppointments.filter(app => app.professionalId === prof.id);
    const totalRevenue = profAppointments.reduce((acc, curr) => acc + (curr.totalPrice || curr.service.price), 0);
    const servicesCount = profAppointments.length;
    
    // Calcular avaliação baseada nos atendimentos (se houver rating)
    const ratedAppointments = profAppointments.filter(app => app.rating !== null);
    const ratingSum = ratedAppointments.reduce((acc, curr) => acc + (curr.rating || 0), 0);
    const calculatedRating = ratedAppointments.length > 0 ? (ratingSum / ratedAppointments.length) : (prof.ratingAverage || 5.0);

    return {
      ...prof,
      totalRevenue,
      servicesCount,
      calculatedRating,
      appointments: profAppointments
    };
  });

  return (
    <div>
      <header className={styles.header}>
        <h1 className={styles.title}>Relatórios de Atendimentos</h1>
      </header>

      <Suspense fallback={<div>Carregando filtros...</div>}>
        <AgendaFilter />
      </Suspense>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', marginTop: '1.5rem' }}>
        {reportData.map(data => (
          <div key={data.id} className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <div style={{ 
                width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#27272A',
                backgroundImage: data.photoUrl ? `url(${data.photoUrl})` : 'none',
                backgroundSize: 'cover', backgroundPosition: 'center'
              }}></div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{data.name}</h2>
                <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>{data.specialty}</p>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <p style={{ fontSize: '1.5rem', color: '#FBBF24', fontWeight: 'bold' }}>★ {data.calculatedRating.toFixed(1)}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Avaliação Média</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '1rem', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Atendimentos</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{data.servicesCount}</p>
              </div>
              <div style={{ padding: '1rem', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Receita Gerada</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)' }}>R$ {data.totalRevenue.toFixed(2).replace('.', ',')}</p>
              </div>
            </div>

            {data.appointments.length > 0 ? (
              <div className="table-responsive" style={{ width: '100%', overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--muted)', textAlign: 'left' }}>
                      <th style={{ padding: '0.5rem 0', fontWeight: 500 }}>Data</th>
                      <th style={{ padding: '0.5rem 0', fontWeight: 500 }}>Serviço(s)</th>
                      <th style={{ padding: '0.5rem 0', fontWeight: 500 }}>Valor</th>
                      <th style={{ padding: '0.5rem 0', fontWeight: 500 }}>Avaliação</th>
                      <th style={{ padding: '0.5rem 0', fontWeight: 500, textAlign: 'right' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.appointments.map(app => (
                      <tr key={app.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.75rem 0' }}>{app.date.toLocaleDateString('pt-BR')} às {app.startTime}</td>
                        <td style={{ padding: '0.75rem 0' }}>{app.serviceNames || app.service.name}</td>
                        <td style={{ padding: '0.75rem 0' }}>R$ {(app.totalPrice || app.service.price).toFixed(2).replace('.', ',')}</td>
                        <td style={{ padding: '0.75rem 0', color: '#FBBF24' }}>
                          {app.rating ? `★ ${app.rating.toFixed(1)}` : 'S/ Avaliação'}
                        </td>
                        <td style={{ padding: '0.75rem 0', textAlign: 'right' }}>
                          <DeleteAppointmentButton id={app.id} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: 'var(--muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>
                Nenhum atendimento concluído neste período.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
