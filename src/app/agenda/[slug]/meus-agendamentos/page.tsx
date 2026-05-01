import { notFound } from 'next/navigation';
import CustomerAppointmentsTracker from './CustomerAppointmentsTracker';
import styles from '../agenda.module.css';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function MeusAgendamentosPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const company = await prisma.company.findUnique({
    where: { slug }
  });

  if (!company) {
    notFound();
  }

  const inlineStyles = {
    '--company-primary': company.primaryColor || '#FFD700',
  } as React.CSSProperties;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `body { background-color: #050505 !important; }`}} />
      <div className={styles.container} style={inlineStyles}>
        <div 
          className={styles.cover} 
          style={{ 
            backgroundColor: '#111',
            backgroundImage: company.coverUrl ? `url(${company.coverUrl})` : 'none',
          }}
        >
          <div className={styles.coverOverlay}></div>
        </div>
        
        <div className={styles.bottomSheet}>
          <div className={styles.headerInfo} style={{ marginBottom: '1.5rem' }}>
            <Link href={`/agenda/${slug}`} style={{ color: 'var(--company-primary)', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 500, marginBottom: '1rem', display: 'inline-block' }}>
              ← Voltar para agendamento
            </Link>
            <h1 className={styles.companyName}>Meus Agendamentos</h1>
            <p className={styles.companyDescription} style={{ marginTop: '0.5rem' }}>
              Consulte seu histórico e próximos horários na {company.name}.
            </p>
          </div>

          <CustomerAppointmentsTracker companySlug={slug} />
        </div>
      </div>
    </>
  );
}
