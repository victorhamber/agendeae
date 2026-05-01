import styles from '../../app.module.css';
import CompanyForm from './CompanyForm';
import { prisma } from '@/lib/prisma';
import { requireCompanySession } from '@/lib/auth/server';

export default async function ConfiguracoesPage() {
  const session = await requireCompanySession();
  const company = await prisma.company.findUnique({ where: { id: session.companyId } });
  if (!company) return <div>Empresa não encontrada</div>;

  return (
    <div>
      <header className={styles.header}>
        <h1 className={styles.title}>Configurações da Empresa</h1>
      </header>

      <div style={{ display: 'grid', gap: '2rem' }}>
        {/* Bloco 1: Dados da Empresa */}
        <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Perfil da Marca</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>
            Personalize a sua agenda pública. Essas informações serão vistas pelos seus clientes.
          </p>
          <CompanyForm company={company} />
        </div>
      </div>
    </div>
  );
}
