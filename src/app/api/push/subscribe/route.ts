import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizePhone } from '@/lib/push/server';

type Body = {
  companyId: string;
  phone: string;
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } };
  userAgent?: string;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const companyId = body.companyId?.trim();
  const phone = normalizePhone(body.phone);
  const endpoint = body.subscription?.endpoint;
  const p256dh = body.subscription?.keys?.p256dh;
  const auth = body.subscription?.keys?.auth;

  if (!companyId) return NextResponse.json({ error: 'companyId obrigatório' }, { status: 400 });
  if (!phone) return NextResponse.json({ error: 'phone obrigatório' }, { status: 400 });
  if (!endpoint || !p256dh || !auth) return NextResponse.json({ error: 'subscription inválida' }, { status: 400 });

  const company = await prisma.company.findUnique({ where: { id: companyId }, select: { id: true, status: true } });
  if (!company || company.status !== 'ACTIVE') {
    return NextResponse.json({ error: 'Empresa indisponível' }, { status: 400 });
  }

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: {
      companyId,
      phone,
      endpoint,
      p256dh,
      auth,
      userAgent: body.userAgent,
    },
    update: {
      companyId,
      phone,
      p256dh,
      auth,
      userAgent: body.userAgent,
    },
  });

  return NextResponse.json({ ok: true });
}

