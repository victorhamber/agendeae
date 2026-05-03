import styles from '../../super-admin.module.css';
import { prisma } from '@/lib/prisma';
import { requireSuperAdminSession } from '@/lib/auth/server';
import PlanForm from './PlanForm';

export const dynamic = 'force-dynamic';

export default async function PlanosPage() {
  await requireSuperAdminSession();

  const plans = await prisma.plan.findMany({
    orderBy: { priceMonthly: 'asc' },
    include: { _count: { select: { licenses: true } } },
  });

  return (
    <div>
      <header className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className={styles.title}>Planos</h1>
      </header>

      {/* Formulário para criar novo plano */}
      <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius)', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Criar Novo Plano</h2>
        <PlanForm />
      </div>

      {/* Lista de planos existentes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {plans.map((plan) => (
          <div key={plan.id} className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius)', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{plan.name}</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>{plan.description || 'Sem descrição'}</p>
              </div>
              <span style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 600,
                backgroundColor: plan.status === 'ACTIVE' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: plan.status === 'ACTIVE' ? 'var(--success)' : 'var(--danger)',
              }}>
                {plan.status}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.75rem', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Mensal</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary)' }}>R$ {plan.priceMonthly.toFixed(0)}</p>
              </div>
              <div style={{ padding: '0.75rem', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Anual</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--success)' }}>R$ {plan.priceYearly.toFixed(0)}</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '4px', backgroundColor: 'rgba(79,70,229,0.1)', color: 'var(--primary)' }}>
                {plan.maxProfessionals} profissionais
              </span>
              <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '4px', backgroundColor: 'rgba(79,70,229,0.1)', color: 'var(--primary)' }}>
                {plan.maxUnits} unidade(s)
              </span>
              {plan.allowReports && <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '4px', backgroundColor: 'rgba(34,197,94,0.1)', color: 'var(--success)' }}>Relatórios</span>}
              {plan.allowWhatsappReminders && <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '4px', backgroundColor: 'rgba(34,197,94,0.1)', color: 'var(--success)' }}>WhatsApp</span>}
              {plan.allowCustomDomain && <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '4px', backgroundColor: 'rgba(34,197,94,0.1)', color: 'var(--success)' }}>Domínio Custom</span>}
              {plan.allowMultipleUsers && <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '4px', backgroundColor: 'rgba(34,197,94,0.1)', color: 'var(--success)' }}>Multi-Usuário</span>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
                {plan._count.licenses} licença(s) vinculadas
              </span>
              <PlanForm plan={plan} isEdit />
            </div>
          </div>
        ))}
      </div>

      {plans.length === 0 && (
        <div className="glass" style={{ padding: '3rem', borderRadius: 'var(--radius)', textAlign: 'center' }}>
          <p style={{ color: 'var(--muted)', fontSize: '1rem' }}>Nenhum plano cadastrado. Crie o primeiro acima.</p>
        </div>
      )}
    </div>
  );
}
