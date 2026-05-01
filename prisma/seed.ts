import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const superEmail = process.env.SEED_SUPER_ADMIN_EMAIL;
  const superPass = process.env.SEED_SUPER_ADMIN_PASSWORD;

  if (superEmail && superPass) {
    const passwordHash = await bcrypt.hash(superPass, 10);
    await prisma.user.upsert({
      where: { email: superEmail.toLowerCase() },
      update: { passwordHash, role: 'SUPER_ADMIN', status: 'ACTIVE', name: 'Super Admin' },
      create: { email: superEmail.toLowerCase(), passwordHash, role: 'SUPER_ADMIN', status: 'ACTIVE', name: 'Super Admin' },
    });
  }

  const ownerEmail = process.env.SEED_COMPANY_OWNER_EMAIL;
  const ownerPass = process.env.SEED_COMPANY_OWNER_PASSWORD;
  const companyName = process.env.SEED_COMPANY_NAME;
  const companySlug = process.env.SEED_COMPANY_SLUG;

  if (ownerEmail && ownerPass && companyName && companySlug) {
    const ownerPasswordHash = await bcrypt.hash(ownerPass, 10);
    const owner = await prisma.user.upsert({
      where: { email: ownerEmail.toLowerCase() },
      update: { passwordHash: ownerPasswordHash, role: 'COMPANY_ADMIN', status: 'ACTIVE', name: 'Admin' },
      create: { email: ownerEmail.toLowerCase(), passwordHash: ownerPasswordHash, role: 'COMPANY_ADMIN', status: 'ACTIVE', name: 'Admin' },
      select: { id: true },
    });

    await prisma.company.upsert({
      where: { slug: companySlug },
      update: { name: companyName, ownerId: owner.id, status: 'ACTIVE' },
      create: { name: companyName, slug: companySlug, ownerId: owner.id, status: 'ACTIVE' },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
