import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildAgendaManifestJson, siteOriginFromRequest } from '@/lib/pwaAgenda';

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const company = await prisma.company.findUnique({
    where: { slug },
    select: { name: true, primaryColor: true, logoUrl: true },
  });

  const name = company?.name ?? 'AGENDEAE';
  const themeColor = company?.primaryColor ?? '#4f46e5';
  const origin = siteOriginFromRequest(req);
  const manifest = buildAgendaManifestJson({
    origin,
    slug,
    name,
    themeColor,
    logoUrl: company?.logoUrl,
  });

  return new NextResponse(JSON.stringify(manifest), {
    headers: { 'content-type': 'application/manifest+json; charset=utf-8' },
  });
}
