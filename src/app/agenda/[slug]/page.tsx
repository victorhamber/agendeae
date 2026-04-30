import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import BookingFlow from './BookingFlow';
import styles from './agenda.module.css';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export default async function AgendaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const company = await prisma.company.findUnique({
    where: { slug },
    include: {
      services: { where: { status: 'ACTIVE' } },
      professionals: { where: { status: 'ACTIVE' } }
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

  // Inject primary color as a CSS variable at the top level
  const inlineStyles = {
    '--company-primary': company.primaryColor || '#FFD700',
  } as React.CSSProperties;

  return (
    <>
      {/* Força o body desta página para preto se for desktop, para as laterais não ficarem brancas */}
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
          <div className={styles.headerInfo}>
            {company.segment && (
              <span className={styles.badge}>{company.segment}</span>
            )}
            <h1 className={styles.companyName}>{company.name}</h1>
            <div style={{ display: 'flex', gap: '0.5rem', color: '#FFD700', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              ★ {companyRating.toFixed(1)} <span style={{ color: '#71717A' }}>• {companyRating >= 4.5 ? 'Excelentes avaliações' : companyRating >= 3.5 ? 'Boas avaliações' : 'Avaliações'}</span>
            </div>
            
            <p className={styles.companyDescription}>
              {company.description}
            </p>

            {/* Socials & Contact */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              {company.address && (
                <span style={{ fontSize: '0.75rem', color: '#A1A1AA' }}>📍 {company.address}</span>
              )}
              {company.instagram && (
                <a href={`https://instagram.com/${company.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: '#A1A1AA', textDecoration: 'none' }}>
                  📷 {company.instagram}
                </a>
              )}
              {company.whatsapp && (
                <a href={`https://wa.me/55${company.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: '#A1A1AA', textDecoration: 'none' }}>
                  💬 Contato
                </a>
              )}
            </div>
          </div>

          {/* Render the Client Component containing the interactive flow */}
          <BookingFlow 
            services={company.services} 
            professionals={company.professionals} 
            companyId={company.id}
            companyName={company.name}
            companyWhatsapp={company.whatsapp || ''}
          />

          <div style={{ marginTop: '2.5rem', padding: '0 1.5rem 2rem 1.5rem' }}>
            <Link 
              href={`/agenda/${slug}/meus-agendamentos`} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.5rem', 
                backgroundColor: '#18181B', 
                border: '1px solid #27272A', 
                color: '#FFF', 
                padding: '1rem', 
                borderRadius: '0.75rem', 
                textDecoration: 'none', 
                fontSize: '0.875rem', 
                fontWeight: 500,
                width: '100%',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}
            >
              <span>📅</span> Ver Meus Agendamentos
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
