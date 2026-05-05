import styles from '../../app.module.css';
import PerfilForm from './PerfilForm';
import AvailabilityForm from '../configuracoes/AvailabilityForm';
import BlockedTimesForm from '../profissionais/[id]/BlockedTimesForm';
import { prisma } from '@/lib/prisma';
import { requireCompanySession } from '@/lib/auth/server';
import { splitAppointmentGross } from '@/lib/commission';

function formatBrl(n: number) {
  return `R$ ${n.toFixed(2).replace('.', ',')}`;
}

export default async function PerfilPage() {
  const session = await requireCompanySession();

  if (session.role !== 'PROFESSIONAL' || !session.professionalId) {
    return (
      <div className={styles.perfilAccessDenied}>
        <h2>Acesso Negado</h2>
        <p>Você precisa estar logado como um profissional para acessar seu perfil.</p>
      </div>
    );
  }

  const professional = await prisma.professional.findUnique({
    where: { id: session.professionalId }
  });

  if (!professional) {
    return <div>Profissional não encontrado.</div>;
  }
  if (professional.companyId !== session.companyId) {
    return <div>Acesso negado.</div>;
  }

  const availabilities = await prisma.availability.findMany({
    where: { professionalId: professional.id },
    orderBy: { dayOfWeek: 'asc' }
  });

  const blockedTimes = await prisma.blockedTime.findMany({
    where: { professionalId: professional.id },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }]
  });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  monthStart.setHours(0, 0, 0, 0);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const completedThisMonth = await prisma.appointment.findMany({
    where: {
      professionalId: professional.id,
      companyId: professional.companyId,
      status: 'COMPLETED',
      date: { gte: monthStart, lt: monthEnd },
    },
    include: { service: true },
  });

  let monthProfessionalShare = 0;
  for (const app of completedThisMonth) {
    const gross = app.totalPrice ?? app.service.price;
    const split = splitAppointmentGross(gross, professional.commissionPercent);
    monthProfessionalShare += split.professionalShare;
  }

  const monthLabel = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const commissionPct = professional.commissionPercent ?? 0;

  return (
    <div>
      <header className={styles.header}>
        <h1 className={styles.title}>Meu Perfil</h1>
      </header>

      <div className={`glass ${styles.perfilEarningsSection}`}>
        <h2 className={styles.perfilEarningsTitle}>Seu resumo no mês</h2>
        <p className={styles.perfilEarningsLead}>
          Atendimentos concluídos em <strong>{monthLabel}</strong>. O valor do seu repasse segue o percentual definido pela empresa
          ({commissionPct.toFixed(0)}% sobre o valor de cada serviço).
        </p>
        <div className={styles.agendaStatsGrid}>
          <div className={styles.agendaStatCard}>
            <p className={styles.agendaStatLabel}>Atendimentos concluídos</p>
            <p className={styles.agendaStatValue}>{completedThisMonth.length}</p>
          </div>
          <div className={styles.agendaStatCard}>
            <p className={styles.agendaStatLabel}>Seu repasse (comissão)</p>
            <p className={`${styles.agendaStatValue} ${styles.agendaStatValuePrimary}`}>{formatBrl(monthProfessionalShare)}</p>
          </div>
        </div>
        <p className={styles.perfilEarningsFootnote}>
          Apenas agendamentos com status <strong>Concluído</strong> entram neste cálculo. Valores são informativos; dúvidas sobre pagamento,
          combine com a administração da empresa.
        </p>
      </div>

      <div className={`glass ${styles.perfilGlassSection}`}>
        <h2 className={styles.perfilSectionTitle}>Foto de Perfil</h2>
        <PerfilForm professional={professional} />
      </div>

      <div className={`glass ${styles.perfilGlassSection}`}>
        <h2 className={`${styles.perfilSectionTitle} ${styles.perfilSectionTitleTight}`}>Meus Horários de Atendimento</h2>
        <p className={styles.perfilSectionDesc}>
          Configure os dias e horários em que você atende. Se o dia for desmarcado, ele aparecerá como indisponível na agenda pública.
        </p>
        <AvailabilityForm 
          professionalId={professional.id} 
          initialData={availabilities} 
        />
      </div>

      <BlockedTimesForm 
        professionalId={professional.id} 
        blockedTimes={blockedTimes} 
      />
    </div>
  );
}
