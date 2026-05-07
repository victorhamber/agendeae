import styles from '../../app.module.css';
import ProfessionalForm from './ProfessionalForm';
import Link from 'next/link';

import DeleteProfessionalButton from './DeleteProfessionalButton';
import { prisma } from '@/lib/prisma';
import { requireCompanySession } from '@/lib/auth/server';

export default async function ProfissionaisPage() {
  const session = await requireCompanySession();
  const company = await prisma.company.findUnique({ where: { id: session.companyId } });
  
  if (!company) {
    return <div>Empresa não encontrada.</div>;
  }

  const professionals = await prisma.professional.findMany({
    where: { 
      companyId: company.id,
      status: { not: 'INACTIVE' }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <header className={styles.header}>
        <h1 className={styles.title}>Profissionais</h1>
        <ProfessionalForm />
      </header>

      <div className="glass" style={{ borderRadius: 'var(--radius)', overflow: 'hidden', width: '100%', maxWidth: '100%' }}>
        <div className="table-responsive" style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 500, color: 'var(--muted)' }}>Nome</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 500, color: 'var(--muted)' }}>Especialidade</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 500, color: 'var(--muted)' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 500, color: 'var(--muted)' }}></th>
              </tr>
            </thead>
            <tbody>
              {professionals.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
                    Nenhum profissional cadastrado.
                  </td>
                </tr>
              ) : (
                professionals.map((professional) => (
                  <tr key={professional.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 500 }}>{professional.name}</div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--muted)' }}>{professional.specialty || 'Não definida'}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '9999px', 
                        fontSize: '0.875rem',
                        backgroundColor: professional.status === 'ACTIVE' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: professional.status === 'ACTIVE' ? 'var(--success)' : 'var(--danger)'
                      }}>
                        {professional.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <ProfessionalForm professional={professional} />
                      <Link href={`/profissionais/${professional.id}/horarios`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500, fontSize: '0.875rem' }}>
                        Horários
                      </Link>
                      <DeleteProfessionalButton professionalId={professional.id} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
