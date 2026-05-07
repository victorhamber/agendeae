import styles from './agenda.module.css';
import type { Metadata, Viewport } from 'next';
import { prisma } from '@/lib/prisma';
import { resolveAgendaIconUrl, siteOriginFromHeaders } from '@/lib/pwaAgenda';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const company = await prisma.company.findUnique({
    where: { slug },
    select: { name: true, description: true, primaryColor: true, logoUrl: true },
  });

  const title = company?.name ? `${company.name} | Agendamento` : 'AGENDEAE | Agendamento';
  const description =
    company?.description?.trim() ||
    'Agende seu horário em poucos cliques. Escolha o serviço, o profissional e o melhor horário.';

  const origin = await siteOriginFromHeaders();
  const iconUrl = resolveAgendaIconUrl(origin, company?.logoUrl);

  // Manifest + ícones por empresa (melhora elegibilidade do "Instalar app")
  return {
    manifest: `/${slug}/manifest.webmanifest`,
    title,
    description,
    icons: {
      icon: [{ url: iconUrl }],
      apple: [{ url: iconUrl }],
    },
  };
}

export async function generateViewport({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Viewport> {
  const { slug } = await params;
  const company = await prisma.company.findUnique({
    where: { slug },
    select: { primaryColor: true },
  });

  return {
    themeColor: company?.primaryColor || '#4f46e5',
  };
}

export default function AgendaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.container}>
      {children}
    </div>
  );
}
