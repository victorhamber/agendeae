'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

import bcrypt from 'bcryptjs';

export async function createProfessional(companyId: string, data: { name: string, specialty: string, email?: string, password?: string }) {
  let userId = null;

  if (data.email && data.password) {
    // Verificar se usuário já existe globalmente
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new Error('Já existe um usuário com este e-mail no sistema.');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const newUser = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: 'PROFESSIONAL'
      }
    });
    userId = newUser.id;
  }

  await prisma.professional.create({
    data: {
      companyId,
      name: data.name,
      specialty: data.specialty,
      email: data.email || null,
      userId,
      status: 'ACTIVE'
    }
  });

  revalidatePath('/app/profissionais');
  return { success: true };
}

export async function deleteProfessional(id: string) {
  await prisma.professional.update({
    where: { id },
    data: { status: 'INACTIVE' } // Soft delete
  });

  revalidatePath('/app/profissionais');
  return { success: true };
}

export async function updateProfessional(id: string, data: { name: string, specialty: string, photoUrl?: string, ratingAverage?: number, email?: string, password?: string }) {
  const prof = await prisma.professional.findUnique({ where: { id } });
  if (!prof) throw new Error('Professional not found');

  let userId = prof.userId;

  if (data.email) {
    // Se enviou e-mail e não tem usuário, ou quer atualizar
    if (!userId && data.password) {
      // Criar novo usuário
      const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
      if (existingUser) throw new Error('Já existe um usuário com este e-mail.');

      const passwordHash = await bcrypt.hash(data.password, 10);
      const newUser = await prisma.user.create({
        data: { name: data.name, email: data.email, passwordHash, role: 'PROFESSIONAL' }
      });
      userId = newUser.id;
    } else if (userId) {
      // Atualizar usuário existente
      const updateData: any = { name: data.name, email: data.email };
      if (data.password) {
        updateData.passwordHash = await bcrypt.hash(data.password, 10);
      }
      // Verificar se o e-mail não choca com outro
      const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
      if (existingUser && existingUser.id !== userId) {
        throw new Error('E-mail já está em uso por outro usuário.');
      }
      await prisma.user.update({ where: { id: userId }, data: updateData });
    }
  }

  await prisma.professional.update({
    where: { id },
    data: {
      name: data.name,
      specialty: data.specialty,
      photoUrl: data.photoUrl,
      ratingAverage: data.ratingAverage,
      email: data.email || prof.email,
      userId
    }
  });

  revalidatePath('/app/profissionais');
  return { success: true };
}
