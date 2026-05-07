import { prisma } from '@/lib/prisma';
import { requireCompanySession } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import styles from '../app.module.css';
import Link from 'next/link';

export default async function AppDashboard() {
  const session = await requireCompanySession();
  
  if (session.role === 'PROFESSIONAL') {
    redirect('/agenda');
  }

  const company = await prisma.company.findUnique({ where: { id: session.companyId } });
  if (!company) return <div>Empresa não encontrada.</div>;

  const [servicesCount, professionalsCount] = await Promise.all([
    prisma.service.count({ where: { companyId: session.companyId } }),
    prisma.professional.count({ where: { companyId: session.companyId } })
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + (7 - today.getDay()));

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  // 1. Agendamentos de Hoje
  const todayAppointmentsCount = await prisma.appointment.count({
    where: {
      companyId: company.id,
      date: { gte: today, lt: tomorrow },
      status: { notIn: ['CANCELLED', 'NO_SHOW'] }
    }
  });

  // 2. Agendamentos da Semana
  const weekAppointmentsCount = await prisma.appointment.count({
    where: {
      companyId: company.id,
      date: { gte: today, lt: endOfWeek },
      status: { notIn: ['CANCELLED', 'NO_SHOW'] }
    }
  });

  // 3. Novos Clientes no Mês
  const newCustomersCount = await prisma.customer.count({
    where: {
      companyId: company.id,
      createdAt: { gte: startOfMonth }
    }
  });

  // 4. Cancelamentos no Mês
  const cancellationsCount = await prisma.appointment.count({
    where: {
      companyId: company.id,
      status: 'CANCELLED',
      date: { gte: startOfMonth }
    }
  });

  // 5. Faltas no Mês
  const noShowCount = await prisma.appointment.count({
    where: {
      companyId: company.id,
      status: 'NO_SHOW',
      date: { gte: startOfMonth }
    }
  });

  // 6. Receita estimada no Mês (Concluídos)
  const completedThisMonth = await prisma.appointment.findMany({
    where: {
      companyId: company.id,
      status: 'COMPLETED',
      date: { gte: startOfMonth, lt: endOfMonth }
    },
    include: { service: true }
  });
  const monthRevenue = completedThisMonth.reduce((sum, a) => sum + (a.totalPrice || a.service.price), 0);

  // 7. Serviço mais agendado (este mês)
  const allMonthAppointments = await prisma.appointment.findMany({
    where: {
      companyId: company.id,
      date: { gte: startOfMonth, lt: endOfMonth },
      status: { notIn: ['CANCELLED'] }
    },
    include: { service: true }
  });

  const serviceCountMap: Record<string, { name: string; count: number }> = {};
  allMonthAppointments.forEach(a => {
    const name = a.serviceNames || a.service.name;
    if (!serviceCountMap[name]) serviceCountMap[name] = { name, count: 0 };
    serviceCountMap[name].count++;
  });
  const topService = Object.values(serviceCountMap).sort((a, b) => b.count - a.count)[0];

  // 8. Profissional mais agendado
  const profCountMap: Record<string, { name: string; count: number }> = {};
  const professionals = await prisma.professional.findMany({ where: { companyId: company.id, status: 'ACTIVE' } });
  const profNameMap = Object.fromEntries(professionals.map(p => [p.id, p.name]));
  allMonthAppointments.forEach(a => {
    const name = profNameMap[a.professionalId] || 'Desconhecido';
    if (!profCountMap[a.professionalId]) profCountMap[a.professionalId] = { name, count: 0 };
    profCountMap[a.professionalId].count++;
  });
  const topProfessional = Object.values(profCountMap).sort((a, b) => b.count - a.count)[0];

  // 9. Próximos Horários
  const now = new Date();
  const nextAppointments = await prisma.appointment.findMany({
    where: {
      companyId: company.id,
      date: { gte: today },
      status: { notIn: ['CANCELLED', 'NO_SHOW', 'COMPLETED'] }
    },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    take: 8,
    include: { customer: true, service: true, professional: true }
  });

  const upcomingAppointments = nextAppointments.filter(app => {
    if (app.date.getTime() === today.getTime()) {
      const [hours, mins] = app.startTime.split(':').map(Number);
      const appTime = new Date(today);
      appTime.setHours(hours, mins, 0, 0);
      return appTime >= now;
    }
    return true;
  }).slice(0, 6);

  // Link público
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const publicLink = `${baseUrl}/${company.slug}`;

  return (
    <div>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href={publicLink} target="_blank" style={{
            padding: '0.5rem 1rem', borderRadius: 'var(--radius)',
            backgroundColor: 'var(--primary)', color: '#fff', fontSize: '0.875rem',
            textDecoration: 'none', fontWeight: 600
          }}>
            🔗 Ver Página Pública
          </Link>
        </div>
      </header>
      
      {/* Onboarding Banner */}
      {(servicesCount === 0 || professionalsCount === 0) && (
        <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius)', marginBottom: '2rem', border: '2px dashed var(--primary)', backgroundColor: 'rgba(79, 70, 229, 0.05)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>👋 Bem-vindo ao AGENDEAE! Vamos preparar sua agenda?</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>Para que seus clientes possam agendar, você precisa configurar o básico.</p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/profissionais" style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius)', backgroundColor: professionalsCount > 0 ? 'var(--success)' : 'var(--primary)', color: '#fff', textDecoration: 'none', fontWeight: 500 }}>
              {professionalsCount > 0 ? '✓ Profissional Adicionado' : '1. Adicionar Profissional'}
            </Link>
            <Link href="/servicos" style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius)', backgroundColor: servicesCount > 0 ? 'var(--success)' : (professionalsCount > 0 ? 'var(--primary)' : 'var(--muted)'), color: '#fff', textDecoration: 'none', fontWeight: 500, pointerEvents: professionalsCount > 0 ? 'auto' : 'none', opacity: professionalsCount > 0 ? 1 : 0.5 }}>
              {servicesCount > 0 ? '✓ Serviço Adicionado' : '2. Adicionar Serviço'}
            </Link>
          </div>
        </div>
      )}

      {/* Cards principais */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="glass" style={{ padding: '1.25rem', borderRadius: 'var(--radius)' }}>
          <h3 style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hoje</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.25rem' }}>{todayAppointmentsCount}</p>
          <p style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>agendamentos</p>
        </div>
        <div className="glass" style={{ padding: '1.25rem', borderRadius: 'var(--radius)' }}>
          <h3 style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Semana</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.25rem' }}>{weekAppointmentsCount}</p>
          <p style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>agendamentos</p>
        </div>
        <div className="glass" style={{ padding: '1.25rem', borderRadius: 'var(--radius)' }}>
          <h3 style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Novos Clientes</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.25rem', color: 'var(--primary)' }}>{newCustomersCount}</p>
          <p style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>este mês</p>
        </div>
        <div className="glass" style={{ padding: '1.25rem', borderRadius: 'var(--radius)' }}>
          <h3 style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Receita (Mês)</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.25rem', color: 'var(--success)' }}>R$ {monthRevenue.toFixed(0)}</p>
          <p style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>concluídos</p>
        </div>
      </div>

      {/* Linha 2 — Stats secundárias */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="glass" style={{ padding: '1.25rem', borderRadius: 'var(--radius)' }}>
          <h3 style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cancelamentos</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.25rem', color: cancellationsCount > 0 ? 'var(--danger)' : 'var(--muted)' }}>{cancellationsCount}</p>
          <p style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>este mês</p>
        </div>
        <div className="glass" style={{ padding: '1.25rem', borderRadius: 'var(--radius)' }}>
          <h3 style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Faltas</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.25rem', color: noShowCount > 0 ? '#F97316' : 'var(--muted)' }}>{noShowCount}</p>
          <p style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>este mês</p>
        </div>
        <div className="glass" style={{ padding: '1.25rem', borderRadius: 'var(--radius)' }}>
          <h3 style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Top Serviço</h3>
          <p style={{ fontSize: '1rem', fontWeight: 'bold', marginTop: '0.25rem' }}>{topService?.name || '—'}</p>
          <p style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>{topService ? `${topService.count} agendamentos` : 'sem dados'}</p>
        </div>
        <div className="glass" style={{ padding: '1.25rem', borderRadius: 'var(--radius)' }}>
          <h3 style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Top Profissional</h3>
          <p style={{ fontSize: '1rem', fontWeight: 'bold', marginTop: '0.25rem' }}>{topProfessional?.name || '—'}</p>
          <p style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>{topProfessional ? `${topProfessional.count} agendamentos` : 'sem dados'}</p>
        </div>
      </div>

      {/* Próximos Horários */}
      <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Próximos Horários</h2>
          <Link href="/agenda" style={{ color: 'var(--primary)', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 500 }}>
            Ver todos →
          </Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {upcomingAppointments.length === 0 ? (
            <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '2rem 0' }}>Nenhum agendamento futuro encontrado.</p>
          ) : (
            upcomingAppointments.map((app) => (
              <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', borderLeft: '3px solid var(--primary)' }}>
                <div>
                  <p style={{ fontWeight: 600 }}>{app.serviceNames || app.service.name}</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
                    {app.customer.name} • {app.professional.name}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{app.startTime}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                    {app.date.getTime() === today.getTime() ? 'Hoje' : app.date.toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
