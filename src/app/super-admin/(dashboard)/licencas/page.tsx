import styles from '../../super-admin.module.css';
import { prisma } from '@/lib/prisma';
import { requireSuperAdminSession } from '@/lib/auth/server';
import LicenseActions from './LicenseActions';
import NewLicenseForm from './NewLicenseForm';

export const dynamic = 'force-dynamic';

const statusColors: Record<string, { bg: string; color: string }> = {
  ACTIVE: { bg: 'rgba(34,197,94,0.1)', color: 'var(--success)' },
  TRIAL: { bg: 'rgba(79,70,229,0.1)', color: 'var(--primary)' },
  EXPIRED: { bg: 'rgba(245,158,11,0.1)', color: '#F59E0B' },
  CANCELLED: { bg: 'rgba(239,68,68,0.1)', color: 'var(--danger)' },
  BLOCKED: { bg: 'rgba(239,68,68,0.1)', color: 'var(--danger)' },
  REFUNDED: { bg: 'rgba(245,158,11,0.1)', color: '#F59E0B' },
  CHARGEBACK: { bg: 'rgba(239,68,68,0.1)', color: 'var(--danger)' },
};

export default async function LicencasPage() {
  await requireSuperAdminSession();

  const licenses = await prisma.license.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      company: { select: { name: true, slug: true, status: true } },
      plan: { select: { name: true, priceMonthly: true } },
    },
  });

  const companies = await prisma.company.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  const plans = await prisma.plan.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true, name: true, priceMonthly: true },
    orderBy: { priceMonthly: 'asc' },
  });

  return (
    <div>
      <header className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className={styles.title}>Licenças</h1>
      </header>

      <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius)', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Nova Licença</h2>
        <NewLicenseForm companies={companies} plans={plans} />
      </div>

      <div className="glass" style={{ borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 500, color: 'var(--muted)' }}>Empresa</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 500, color: 'var(--muted)' }}>Plano</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 500, color: 'var(--muted)' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 500, color: 'var(--muted)' }}>Início</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 500, color: 'var(--muted)' }}>Vencimento</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 500, color: 'var(--muted)' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {licenses.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
                    Nenhuma licença cadastrada.
                  </td>
                </tr>
              ) : (
                licenses.map((license) => {
                  const sc = statusColors[license.status] || { bg: 'rgba(0,0,0,0.05)', color: 'var(--muted)' };
                  const isExpired = license.expiresAt && new Date(license.expiresAt) < new Date();
                  return (
                    <tr key={license.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 600 }}>{license.company.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>/{license.company.slug}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ fontWeight: 500 }}>{license.plan.name}</span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>R$ {license.plan.priceMonthly}/mês</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: sc.bg,
                          color: sc.color,
                        }}>
                          {license.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                        {license.startsAt.toLocaleDateString('pt-BR')}
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                        {license.expiresAt ? (
                          <span style={{ color: isExpired ? 'var(--danger)' : 'inherit', fontWeight: isExpired ? 600 : 400 }}>
                            {license.expiresAt.toLocaleDateString('pt-BR')}
                            {isExpired && ' (vencida)'}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--muted)' }}>Sem vencimento</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <LicenseActions license={{ id: license.id, status: license.status, expiresAt: license.expiresAt?.toISOString() || null }} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
