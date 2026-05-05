import { prisma } from '../src/lib/prisma';
import { safeTz, ymdToUtcDate } from '../src/lib/datetime';

function ymdFromUtcDate(d: Date) {
  // Usa o dia em UTC como "intenção" (era assim que os registros antigos eram gravados no servidor UTC).
  return d.toISOString().slice(0, 10);
}

async function main() {
  const companies = await prisma.company.findMany({ select: { id: true, timezone: true } });
  let updatedAppointments = 0;
  let updatedBlockedTimes = 0;

  for (const company of companies) {
    const tz = safeTz(company.timezone);

    const appointments = await prisma.appointment.findMany({
      where: { companyId: company.id },
      select: { id: true, date: true },
    });

    for (const a of appointments) {
      const ymd = ymdFromUtcDate(a.date);
      const newDate = ymdToUtcDate(ymd, tz);
      if (a.date.getTime() !== newDate.getTime()) {
        await prisma.appointment.update({ where: { id: a.id }, data: { date: newDate } });
        updatedAppointments += 1;
      }
    }

    const blocked = await prisma.blockedTime.findMany({
      where: { companyId: company.id },
      select: { id: true, date: true },
    });

    for (const b of blocked) {
      const ymd = ymdFromUtcDate(b.date);
      const newDate = ymdToUtcDate(ymd, tz);
      if (b.date.getTime() !== newDate.getTime()) {
        await prisma.blockedTime.update({ where: { id: b.id }, data: { date: newDate } });
        updatedBlockedTimes += 1;
      }
    }
  }

  console.log(
    JSON.stringify(
      { ok: true, updatedAppointments, updatedBlockedTimes, companies: companies.length },
      null,
      2
    )
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

