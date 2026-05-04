import { notFound } from 'next/navigation';
import Link from 'next/link';
import BookingFlow from './BookingFlow';
import styles from './agenda.module.css';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function companyPrimaryThemeClass(primaryColor: string | null | undefined): string {
  const raw = (primaryColor || '').trim().toLowerCase();
  const hex = raw.startsWith('#') ? raw.slice(1) : raw;
  if (hex.length !== 6 || !/^[0-9a-f]{6}$/.test(hex)) {
    return styles.themeGold;
  }
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  const hue = h * 360;
  const s = max === 0 ? 0 : d / max;

  if (s < 0.12) {
    return styles.themeZinc;
  }
  if (hue < 18 || hue >= 345) return styles.themeRed;
  if (hue < 40) return styles.themeOrange;
  if (hue < 55) return styles.themeAmber;
  if (hue < 75) return styles.themeGold;
  if (hue < 95) return styles.themeLime;
  if (hue < 150) return styles.themeGreen;
  if (hue < 175) return styles.themeTeal;
  if (hue < 200) return styles.themeCyan;
  if (hue < 230) return styles.themeBlue;
  if (hue < 260) return styles.themeIndigo;
  if (hue < 285) return styles.themePurple;
  if (hue < 320) return styles.themePink;
  if (hue < 345) return styles.themeRose;
  return styles.themeGold;
}

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

  const themeClass = companyPrimaryThemeClass(company.primaryColor);
  const ratingLabel =
    companyRating >= 4.5 ? 'Excelentes avaliações' : companyRating >= 3.5 ? 'Boas avaliações' : 'Avaliações';

  return (
    <>
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
          </div>

          {/* Render the Client Component containing the interactive flow */}
          <BookingFlow 
            services={company.services} 
            professionals={company.professionals} 
            companyId={company.id}
            companyWhatsapp={company.whatsapp || ''}
            companySlug={slug}
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
