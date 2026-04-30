import { PrismaClient } from '@prisma/client';
import styles from '../../../../app.module.css';
import AvailabilityForm from '../../../configuracoes/AvailabilityForm';
import BlockedTimesForm from '../BlockedTimesForm';
import Link from 'next/link';

const prisma = new PrismaClient();

export default async function ProfissionalHorariosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const professional = await prisma.professional.findUnique({
    where: { id }
  });

  if (!professional) {
    return <div>Profissional não encontrado.</div>;
  }

  const availabilities = await prisma.availability.findMany({
    where: { professionalId: id },
    orderBy: { dayOfWeek: 'asc' }
  });

  const blockedTimes = await prisma.blockedTime.findMany({
    where: { professionalId: id },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }]
  });

  return (
    <div>
      <header className={styles.header} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
        <Link href="/profissionais" style={{ color: 'var(--primary)', fontWeight: 500, fontSize: '0.875rem' }}>
          ← Voltar para Profissionais
        </Link>
        <h1 className={styles.title}>Horários de {professional.name}</h1>
      </header>

      <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Grade de Horários</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>
          Configure os dias e horários em que {professional.name} atende. Se o dia for desmarcado, ele aparecerá como indisponível na agenda pública.
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

