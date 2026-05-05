import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const company = await prisma.company.findUnique({
    where: { slug },
    select: { name: true, primaryColor: true, logoUrl: true },
  });

  const name = company?.name ?? 'AGENDAAE';
  const themeColor = company?.primaryColor ?? '#4f46e5';

  const manifest = {
    name,
    short_name: name.slice(0, 12),
    start_url: `/${slug}`,
    scope: `/${slug}/`,
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: themeColor,
    icons: [
      company?.logoUrl
        ? { src: company.logoUrl, sizes: '512x512', type: 'image/png', purpose: 'any' }
        : { src: '/next.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
  };

  return new NextResponse(JSON.stringify(manifest), {
    headers: { 'content-type': 'application/manifest+json; charset=utf-8' },
  });
}

