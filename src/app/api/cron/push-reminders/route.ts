import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizePhone, sendWebPush } from '@/lib/push/server';
import { safeTz } from '@/lib/datetime';
import { DateTime } from 'luxon';

function appointmentStartUtc(dateOnlyUtc: Date, startTime: string, tz: string) {
  const [h, m] = startTime.split(':').map(Number);
  // dateOnlyUtc é o início do dia (UTC) do dia local da empresa. Convertemos para o TZ, setamos o horário, e voltamos a UTC.
  const base = DateTime.fromJSDate(dateOnlyUtc, { zone: 'utc' }).setZone(tz);
  return base.set({ hour: h || 0, minute: m || 0, second: 0, millisecond: 0 }).toUTC().toJSDate();
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get('token') ?? '';
  const isVercelCron = (req.headers.get('x-vercel-cron') ?? '') === '1';
  const hasSecret = !!process.env.CRON_SECRET;
  const okBySecret = hasSecret && token === process.env.CRON_SECRET;
  if (!isVercelCron && !okBySecret) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const now = new Date();
  const targetStart = new Date(now.getTime() + 20 * 60 * 1000 - 60 * 1000);
  const targetEnd = new Date(now.getTime() + 20 * 60 * 1000 + 60 * 1000);

  // `appointment.date` é o início do dia (UTC) conforme o fuso da empresa — não use meia-noite do servidor.
  // Janela em dias UTC (-1 .. +2) cobre virada de dia UTC vs. Brasil e mantém a consulta pequena.
  const utcMidnight = DateTime.fromJSDate(now, { zone: 'utc' }).startOf('day');
  const rangeStart = utcMidnight.minus({ days: 1 }).toJSDate();
  const rangeEnd = utcMidnight.plus({ days: 2 }).endOf('day').toJSDate();

  const candidates = await prisma.appointment.findMany({
    where: {
      status: { in: ['CONFIRMED'] },
      date: { gte: rangeStart, lte: rangeEnd },
    },
    include: {
      customer: true,
      company: { select: { id: true, name: true, slug: true, timezone: true } },
      professional: { select: { name: true } },
      service: { select: { name: true } },
    },
  });

  let scanned = 0;
  let eligible = 0;
  let sent = 0;
  let missingSub = 0;
  let skippedAlreadySent = 0;
  let failed = 0;

  for (const appt of candidates) {
    scanned += 1;
    const tz = safeTz(appt.company.timezone);
    const when = appointmentStartUtc(appt.date, appt.startTime, tz);
    if (when < targetStart || when > targetEnd) continue;
    eligible += 1;

    const already = await prisma.appointmentReminder.findUnique({
      where: { appointmentId_type: { appointmentId: appt.id, type: 'REMINDER_20M' } },
      select: { id: true },
    });
    if (already) {
      skippedAlreadySent += 1;
      continue;
    }

    const phone = normalizePhone(appt.customer.whatsapp || '');
    if (!phone) {
      missingSub += 1;
      continue;
    }

    const subscription = await prisma.pushSubscription.findFirst({
      where: { companyId: appt.companyId, phone },
      select: { endpoint: true, p256dh: true, auth: true },
    });
    if (!subscription) {
      missingSub += 1;
      continue;
    }

    const base = (process.env.NEXT_PUBLIC_APP_URL ?? '').replace(/\/$/, '');
    const path = `/${appt.company.slug}/meus-agendamentos`;
    const openUrl = base ? `${base}${path}` : path;

    try {
      await sendWebPush(
        { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } },
        {
          title: `Falta 20 minutos para seu atendimento`,
          body: `${appt.customer.name}, seu horário é às ${appt.startTime} com ${appt.professional.name}.`,
          url: openUrl,
        }
      );

      await prisma.appointmentReminder.create({
        data: { companyId: appt.companyId, appointmentId: appt.id, type: 'REMINDER_20M' },
      });
      sent += 1;
    } catch (e: unknown) {
      failed += 1;
      // Se a subscription estiver inválida, removemos para não tentar eternamente.
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('410') || msg.includes('404') || msg.toLowerCase().includes('gone')) {
        await prisma.pushSubscription.delete({ where: { endpoint: subscription.endpoint } }).catch(() => null);
      }
    }
  }

  return NextResponse.json({ ok: true, scanned, eligible, sent, missingSub, skippedAlreadySent, failed });
}

