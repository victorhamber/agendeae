import styles from '../../app.module.css';
import CompanyForm from './CompanyForm';
import BookingRulesForm from './BookingRulesForm';
import { prisma } from '@/lib/prisma';
import { requireCompanySession } from '@/lib/auth/server';

export default async function ConfiguracoesPage() {
  const session = await requireCompanySession();
  const company = await prisma.company.findUnique({ where: { id: session.companyId } });
  if (!company) return <div>Empresa não encontrada</div>;

  const bookingRules = await prisma.bookingRule.findUnique({
    where: { companyId: session.companyId },
  });

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

        {/* Bloco 2: Regras de Agendamento */}
        <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Regras de Agendamento</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>
            Defina prazos de antecedência, cancelamento e reagendamento para seus clientes.
          </p>
          <BookingRulesForm rules={bookingRules ? {
            minAdvanceHours: bookingRules.minAdvanceHours,
            maxAdvanceDays: bookingRules.maxAdvanceDays,
            allowCancellation: bookingRules.allowCancellation,
            cancellationDeadlineHours: bookingRules.cancellationDeadlineHours,
            allowReschedule: bookingRules.allowReschedule,
            rescheduleDeadlineHours: bookingRules.rescheduleDeadlineHours,
            allowAnyProfessional: bookingRules.allowAnyProfessional,
          } : null} />
        </div>
      </div>
    </div>
  );
}
