import { notFound } from 'next/navigation';
import Link from 'next/link';
import BookingFlow from './BookingFlow';
import InstallAppButton from './InstallAppButton';
import ServiceWorkerRegister from './ServiceWorkerRegister';
import styles from './agenda.module.css';
import { getAgendaThemeClass } from './agendaTheme';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AgendaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const company = await prisma.company.findUnique({
    where: { slug },
    include: {
      services: { where: { status: 'ACTIVE' } },
      professionals: { where: { status: 'ACTIVE' } },
      bookingRules: true,
    }
  });

  if (!company) {
    notFound();
  }

  // Calcular avaliação média real da empresa
  const profsWithRating = company.professionals.filter(p => p.ratingAverage != null);
  const companyRating = profsWithRating.length > 0
    ? profsWithRating.reduce((sum, p) => sum + (p.ratingAverage || 5), 0) / profsWithRating.length
    : 5.0;

  const themeClass = getAgendaThemeClass(company.primaryColor);
  const ratingLabel =
    companyRating >= 4.5 ? 'Excelentes avaliações' : companyRating >= 3.5 ? 'Boas avaliações' : 'Avaliações';

  return (
    <>
      <ServiceWorkerRegister slug={slug} />
      <div className={[styles.container, themeClass].filter(Boolean).join(' ')}>
        <div className={styles.cover}>
          {company.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={company.coverUrl} alt="" className={styles.coverMedia} />
          ) : null}
          <div className={styles.coverOverlay}></div>
        </div>
        
        <div className={styles.bottomSheet}>
          <div className={styles.headerInfo}>
            {company.segment && (
              <span className={styles.badge}>{company.segment}</span>
            )}
            <h1 className={styles.companyName}>{company.name}</h1>
            <div className={styles.ratingRow}>
              ★ {companyRating.toFixed(1)}{' '}
              <span className={styles.ratingMuted}>• {ratingLabel}</span>
            </div>
            
            <p className={styles.companyDescription}>
              {company.description}
            </p>

            {/* Socials & Contact */}
            <div className={styles.socialRow}>
              {company.address && (
                <span className={styles.addressLine}>📍 {company.address}</span>
              )}
              {company.instagram && (
                <a
                  href={`https://instagram.com/${company.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/icons/instagram.png" alt="" className={styles.socialIcon} />
                  <span>{company.instagram}</span>
                </a>
              )}
              {company.whatsapp && (
                <a
                  href={`https://wa.me/55${company.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/icons/whatsapp.png" alt="" className={styles.socialIcon} />
                  <span>Contato</span>
                </a>
              )}
            </div>

            <InstallAppButton companyName={company.name} />
          </div>

          {/*
            Fluxo multi-tenant: slug (URL) → esta empresa (`company.id`) → BookingFlow só lista
            serviços/profissionais desta empresa; ao confirmar, `createAppointment` valida de novo
            `companyId` + `professionalId` e aplica conflitos com filtro por empresa.
          */}
          <BookingFlow 
            services={company.services} 
            professionals={company.professionals} 
            companyId={company.id}
            companyWhatsapp={company.whatsapp || ''}
            companyTimezone={company.timezone}
            slug={slug}
            allowAnyProfessional={company.bookingRules?.allowAnyProfessional ?? true}
            allowCancellation={company.bookingRules?.allowCancellation ?? true}
            maxAdvanceDays={company.bookingRules?.maxAdvanceDays ?? 60}
          />

          <div className={styles.appointmentsLinkWrap}>
            <Link 
              href={`/${slug}/meus-agendamentos`} 
              className={styles.appointmentsLink}
            >
              <span>📅</span> Ver Meus Agendamentos
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
