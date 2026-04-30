import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Create User (Owner)
  const user = await prisma.user.create({
    data: {
      name: 'João Barbeiro',
      email: 'joao@barbearia.com',
      passwordHash: 'hashed_password_placeholder',
      role: 'COMPANY_ADMIN',
    },
  });

  // 2. Create Company
  const company = await prisma.company.create({
    data: {
      ownerId: user.id,
      name: 'Barbearia do João',
      slug: 'barbearia-do-joao',
      segment: 'Barbearia',
      primaryColor: '#4f46e5',
      description: 'A melhor barbearia da região.',
    },
  });

  // 3. Create Services
  const service1 = await prisma.service.create({
    data: {
      companyId: company.id,
      name: 'Corte de Cabelo',
      price: 50.0,
      durationMinutes: 30,
    },
  });

  const service2 = await prisma.service.create({
    data: {
      companyId: company.id,
      name: 'Barba Completa',
      price: 35.0,
      durationMinutes: 20,
    },
  });

  // 4. Create Professional
  const prof = await prisma.professional.create({
    data: {
      companyId: company.id,
      name: 'João Silva',
      specialty: 'Barbeiro Master',
    },
  });

  // 5. Link Professional to Services
  await prisma.professionalService.createMany({
    data: [
      { companyId: company.id, professionalId: prof.id, serviceId: service1.id },
      { companyId: company.id, professionalId: prof.id, serviceId: service2.id },
    ],
  });

  // 6. Create Availability
  for (let i = 1; i <= 5; i++) {
    // Monday to Friday
    await prisma.availability.create({
      data: {
        companyId: company.id,
        professionalId: prof.id,
        dayOfWeek: i,
        startTime: '09:00',
        endTime: '18:00',
        breakStartTime: '12:00',
        breakEndTime: '13:00',
      },
    });
  }

  console.log('Seed executed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
