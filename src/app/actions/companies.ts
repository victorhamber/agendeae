'use server';

import { prisma } from '@/lib/prisma';
import { requireSuperAdminSession } from '@/lib/auth/server';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export async function createCompany(formData: FormData) {
  await requireSuperAdminSession();

  const name = String(formData.get('name') || '').trim();
  const slug = String(formData.get('slug') || '').trim().toLowerCase();
  const ownerName = String(formData.get('ownerName') || '').trim();
  const ownerEmail = String(formData.get('ownerEmail') || '').trim().toLowerCase();
  const ownerPassword = String(formData.get('ownerPassword') || '');

  if (!name || !slug || !ownerName || !ownerEmail || !ownerPassword) {
    throw new Error('Todos os campos são obrigatórios.');
  }

  // Verificar se o slug já existe
  const existingCompany = await prisma.company.findUnique({ where: { slug } });
  if (existingCompany) {
    throw new Error('Slug já em uso. Escolha outro.');
  }

  // Verificar se o e-mail já existe
  const existingUser = await prisma.user.findUnique({ where: { email: ownerEmail } });
  if (existingUser) {
    throw new Error('E-mail já está em uso.');
  }

  const passwordHash = await bcrypt.hash(ownerPassword, 10);

  // Criar o dono e a empresa numa transação
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: ownerName,
        email: ownerEmail,
        passwordHash,
        role: 'COMPANY_ADMIN',
        status: 'ACTIVE',
      }
    });

    await tx.company.create({
      data: {
        name,
        slug,
        ownerId: user.id,
        status: 'ACTIVE',
      }
    });
  });

  revalidatePath('/empresas');
  revalidatePath('/licencas');
}
