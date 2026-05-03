import styles from '../super-admin.module.css';
import { prisma } from '@/lib/prisma';
import { requireSuperAdminSession } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';

export default async function SuperAdminDashboard() {
  await requireSuperAdminSession();

  const [
    totalCompanies,
    activeCompanies,
    blockedCompanies,
    trialCompanies,
    totalAppointments,
    monthAppointments,
    activeLicenses,
  ] = await Promise.all([
    prisma.company.count(),
    prisma.company.count({ where: { status: 'ACTIVE' } }),
    prisma.company.count({ where: { status: 'BLOCKED' } }),
    prisma.company.count({ where: { status: 'TRIAL' } }),
    prisma.appointment.count(),
    prisma.appointment.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
    prisma.license.count({ where: { status: 'ACTIVE' } }),
  ]);

  // Receita estimada (soma do preço mensal dos planos ativos)
  const licenses = await prisma.license.findMany({
    where: { status: 'ACTIVE' },
    include: { plan: true },
  });
  const mrr = licenses.reduce((sum, l) => sum + l.plan.priceMonthly, 0);

  // Novas empresas este mês
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const newThisMonth = await prisma.company.count({
    where: { createdAt: { gte: startOfMonth } },
  });

  const cards = [
    { label: 'Total de Empresas', value: totalCompanies, color: '' },
    { label: 'Empresas Ativas', value: activeCompanies, color: 'var(--success)' },
    { label: 'Em Trial', value: trialCompanies, color: 'var(--primary)' },
    { label: 'Bloqueadas', value: blockedCompanies, color: 'var(--danger)' },
    { label: 'Novas (Mês)', value: newThisMonth, color: 'var(--primary)' },
    { label: 'Licenças Ativas', value: activeLicenses, color: 'var(--success)' },
    { label: 'Agendamentos (Mês)', value: monthAppointments, color: '' },
    { label: 'Agendamentos (Total)', value: totalAppointments, color: '' },
    { label: 'MRR Estimado', value: `R$ ${mrr.toFixed(0)}`, color: 'var(--success)' },
  ];

  return (
    <div>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard Global</h1>
      </header>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {cards.map((card) => (
          <div key={card.label} className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius)' }}>
            <h3 style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.label}</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.25rem', color: card.color || 'inherit' }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
