import styles from '../../super-admin.module.css';
import { prisma } from '@/lib/prisma';
import { requireSuperAdminSession } from '@/lib/auth/server';
import NewCompanyForm from './NewCompanyForm';

export const dynamic = 'force-dynamic';

export default async function EmpresasPage() {
  await requireSuperAdminSession();
  const companies = await prisma.company.findMany({
    orderBy: { createdAt: 'desc' },
    include: { owner: true }
  });

  return (
    <div>
      <header className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className={styles.title}>Empresas</h1>
        <NewCompanyForm />
      </header>

      <div className="glass" style={{ borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 500, color: 'var(--muted)' }}>Nome</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 500, color: 'var(--muted)' }}>Dono / E-mail</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 500, color: 'var(--muted)' }}>Slug</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 500, color: 'var(--muted)' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 500, color: 'var(--muted)' }}>Data de Criação</th>
            </tr>
          </thead>
          <tbody>
            {companies.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
                  Nenhuma empresa cadastrada.
                </td>
              </tr>
            ) : (
              companies.map((company) => (
                <tr key={company.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{company.name}</td>
                  <td style={{ padding: '1rem' }}>
                    <div>{company.owner?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{company.owner?.email}</div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--muted)', fontSize: '0.875rem' }}>{company.slug}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '9999px', 
                      fontSize: '0.875rem',
                      backgroundColor: company.status === 'ACTIVE' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: company.status === 'ACTIVE' ? 'var(--success)' : 'var(--danger)'
                    }}>
                      {company.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--muted)' }}>
                    {company.createdAt.toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
