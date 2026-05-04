import { notFound } from 'next/navigation';
import CustomerAppointmentsTracker from './CustomerAppointmentsTracker';
import styles from '../agenda.module.css';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getAgendaThemeClass } from '../agendaTheme';

export default async function MeusAgendamentosPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const company = await prisma.company.findUnique({
    where: { slug },
  });

  if (!company) {
    notFound();
  }

  const themeClass = getAgendaThemeClass(company.primaryColor);

  return (
    <div className={[styles.container, themeClass].filter(Boolean).join(' ')}>
      <div className={styles.cover}>
        {company.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={company.coverUrl} alt="" className={styles.coverMedia} />
        ) : null}
        <div className={styles.coverOverlay} />
      </div>

      <div className={styles.bottomSheet}>
        <div className={`${styles.headerInfo} ${styles.headerInfoTight}`}>
          <Link href={`/${slug}`} className={styles.linkPrimary}>
            ← Voltar para agendamento
          </Link>
          <h1 className={styles.companyName}>Meus Agendamentos</h1>
          <p className={styles.companyDescription}>
            Consulte seu histórico e próximos horários na {company.name}.
          </p>
        </div>

        <CustomerAppointmentsTracker companySlug={slug} />
      </div>
    </div>
  );
}
