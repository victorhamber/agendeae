import { PrismaClient } from '@prisma/client';
import { getMockAuth } from '@/app/actions/auth';
import styles from '../../app.module.css';
import PerfilForm from './PerfilForm';
import AvailabilityForm from '../configuracoes/AvailabilityForm';
import BlockedTimesForm from '../profissionais/[id]/BlockedTimesForm';

const prisma = new PrismaClient();

export default async function PerfilPage() {
  const { role, professionalId } = await getMockAuth();

  if (role !== 'PROFESSIONAL' || !professionalId) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
        <h2>Acesso Negado</h2>
        <p>Você precisa estar logado como um profissional para acessar seu perfil.</p>
      </div>
    );
  }

  const professional = await prisma.professional.findUnique({
    where: { id: professionalId }
  });

  if (!professional) {
    return <div>Profissional não encontrado.</div>;
  }

  const availabilities = await prisma.availability.findMany({
    where: { professionalId: professional.id },
    orderBy: { dayOfWeek: 'asc' }
  });

  const blockedTimes = await prisma.blockedTime.findMany({
    where: { professionalId: professional.id },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }]
  });

  return (
    <div>
      <header className={styles.header}>
        <h1 className={styles.title}>Meu Perfil</h1>
      </header>

      <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius)', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Foto de Perfil</h2>
        <PerfilForm professional={professional} />
      </div>

      <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius)', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Meus Horários de Atendimento</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>
          Configure os dias e horários em que você atende. Se o dia for desmarcado, ele aparecerá como indisponível na agenda pública.
        </p>
        <AvailabilityForm 
          companyId={professional.companyId} 
          professionalId={professional.id} 
          initialData={availabilities} 
        />
      </div>

      <BlockedTimesForm 
        companyId={professional.companyId} 
        professionalId={professional.id} 
        blockedTimes={blockedTimes} 
      />
    </div>
  );
}
