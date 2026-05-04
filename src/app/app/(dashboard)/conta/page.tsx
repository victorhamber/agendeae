import styles from '../../app.module.css';
import { prisma } from '@/lib/prisma';
import { requireCompanySession } from '@/lib/auth/server';
import ChangePasswordForm from './ChangePasswordForm';

function formatDate(d?: Date | null) {
  if (!d) return '—';
  return d.toLocaleDateString('pt-BR');
}

export const dynamic = 'force-dynamic';

export default async function ContaPage() {
  const session = await requireCompanySession();

  const [company, license] = await Promise.all([
    prisma.company.findUnique({
      where: { id: session.companyId },
      select: { id: true, name: true, status: true, createdAt: true },
    }),
    prisma.license.findFirst({
      where: { companyId: session.companyId },
      orderBy: [{ expiresAt: 'desc' }, { trialEndsAt: 'desc' }],
      include: { plan: true },
    }),
  ]);

  if (!company) return <div>Empresa não encontrada.</div>;

  const renewalDate = license?.expiresAt ?? license?.trialEndsAt ?? null;

  return (
    <div>
      <header className={styles.header}>
        <h1 className={styles.title}>Minha Conta</h1>
      </header>

      <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius)', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Status da Licença</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Empresa</p>
            <p style={{ fontSize: '1.125rem', fontWeight: 700, marginTop: '0.25rem' }}>{company.name}</p>
          </div>

          <div style={{ padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Plano</p>
            <p style={{ fontSize: '1.125rem', fontWeight: 700, marginTop: '0.25rem' }}>{license?.plan?.name ?? '—'}</p>
          </div>

          <div style={{ padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</p>
            <p style={{ fontSize: '1.125rem', fontWeight: 700, marginTop: '0.25rem' }}>{license?.status ?? '—'}</p>
          </div>

          <div style={{ padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Renovação</p>
            <p style={{ fontSize: '1.125rem', fontWeight: 700, marginTop: '0.25rem' }}>{formatDate(renewalDate)}</p>
          </div>
        </div>

        {!license && (
          <p style={{ marginTop: '1rem', color: 'var(--muted)', fontSize: '0.875rem' }}>
            Nenhuma licença encontrada para esta empresa.
          </p>
        )}
      </div>

      <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Segurança</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
          Redefina sua senha para manter sua conta protegida.
        </p>

        <ChangePasswordForm />
      </div>
    </div>
  );
}

