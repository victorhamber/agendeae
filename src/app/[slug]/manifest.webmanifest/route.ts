import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Manifest acessível em /{slug}/manifest.webmanifest (sem depender de rewrite/middleware).
export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const company = await prisma.company.findUnique({
    where: { slug },
    select: { name: true, primaryColor: true, logoUrl: true },
  });

  const name = company?.name ?? 'AGENDAAE';
  const themeColor = company?.primaryColor ?? '#4f46e5';
  const iconUrl = company?.logoUrl || '/next.svg';

  const manifest = {
    name,
    short_name: name.slice(0, 12),
    start_url: `/${slug}`,
    scope: `/${slug}/`,
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: themeColor,
    icons: [
      { src: iconUrl, sizes: '192x192', purpose: 'any maskable' },
      { src: iconUrl, sizes: '512x512', purpose: 'any maskable' },
    ],
  };

  return new NextResponse(JSON.stringify(manifest), {
    headers: { 'content-type': 'application/manifest+json; charset=utf-8' },
  });
}

