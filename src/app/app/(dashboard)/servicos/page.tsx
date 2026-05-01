import styles from '../../app.module.css';
import ServiceForm from './ServiceForm';
import DeleteServiceButton from './DeleteServiceButton';
import { prisma } from '@/lib/prisma';
import { requireCompanySession } from '@/lib/auth/server';

export default async function ServicosPage() {
  const session = await requireCompanySession();
  const company = await prisma.company.findUnique({ where: { id: session.companyId } });
  
  if (!company) {
    return <div>Empresa não encontrada.</div>;
  }

  const services = await prisma.service.findMany({
    where: { 
      companyId: company.id,
      status: { not: 'INACTIVE' }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <header className={styles.header}>
        <h1 className={styles.title}>Serviços</h1>
        <ServiceForm />
      </header>

      <div className="glass" style={{ borderRadius: 'var(--radius)', overflow: 'hidden', width: '100%', maxWidth: '100%' }}>
        <div className="table-responsive" style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 500, color: 'var(--muted)', width: '60px' }}>Foto</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 500, color: 'var(--muted)' }}>Nome / Descrição</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 500, color: 'var(--muted)' }}>Duração</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 500, color: 'var(--muted)' }}>Preço</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 500, color: 'var(--muted)' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 500, color: 'var(--muted)' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {services.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
                    Nenhum serviço cadastrado.
                  </td>
                </tr>
              ) : (
                services.map((service) => (
                  <tr key={service.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    {/* Foto */}
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden',
                        backgroundColor: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {service.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={service.imageUrl} alt={service.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ color: 'var(--muted)', fontSize: '1.25rem' }}>✂️</span>
                        )}
                      </div>
                    </td>
                    {/* Nome + Descrição */}
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <p style={{ fontWeight: 600, margin: '0 0 0.15rem 0' }}>{service.name}</p>
                      {service.description && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: 0, maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {service.description}
                        </p>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--muted)' }}>{service.durationMinutes} min</td>
                    <td style={{ padding: '0.75rem 1rem' }}>R$ {service.price.toFixed(2).replace('.', ',')}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '9999px', 
                        fontSize: '0.875rem',
                        backgroundColor: service.status === 'ACTIVE' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: service.status === 'ACTIVE' ? 'var(--success)' : 'var(--danger)'
                      }}>
                        Ativo
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', display: 'flex', gap: '1rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <ServiceForm service={service} />
                      <DeleteServiceButton serviceId={service.id} />
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
