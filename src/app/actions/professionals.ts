'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireCompanySession } from '@/lib/auth/server';

import bcrypt from 'bcryptjs';

export async function createProfessional(data: {
  name: string;
  specialty: string;
  email?: string;
  password?: string;
  commissionPercent?: number;
}) {
  const session = await requireCompanySession();
  if (session.role !== 'COMPANY_ADMIN') throw new Error('Apenas o administrador pode cadastrar profissionais.');
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

  const pct =
    typeof data.commissionPercent === 'number'
      ? Math.min(100, Math.max(0, data.commissionPercent))
      : 0;

  await prisma.professional.create({
    data: {
      companyId: session.companyId,
      name: data.name,
      specialty: data.specialty,
      email: data.email || null,
      userId,
      status: 'ACTIVE',
      commissionPercent: pct,
    }
  });

  revalidatePath('/app/profissionais');
  revalidatePath('/app/relatorios');
  return { success: true };
}

export async function deleteProfessional(id: string) {
  const session = await requireCompanySession();
  if (session.role !== 'COMPANY_ADMIN') throw new Error('Sem permissão');
  const prof = await prisma.professional.findUnique({ where: { id }, select: { companyId: true } });
  if (!prof || prof.companyId !== session.companyId) throw new Error('Sem permissão');
  await prisma.professional.update({
    where: { id },
    data: { status: 'INACTIVE' } // Soft delete
  });

  revalidatePath('/app/profissionais');
  revalidatePath('/app/relatorios');
  return { success: true };
}

export async function updateProfessional(
  id: string,
  data: {
    name: string;
    specialty: string;
    photoUrl?: string;
    ratingAverage?: number;
    email?: string;
    password?: string;
    commissionPercent?: number;
  }
) {
  const session = await requireCompanySession();
  const prof = await prisma.professional.findUnique({ where: { id } });
  if (!prof) throw new Error('Professional not found');
  if (prof.companyId !== session.companyId) throw new Error('Sem permissão');
  if (session.role === 'PROFESSIONAL' && session.professionalId !== id) throw new Error('Sem permissão');

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
      const updateData: { name: string; email: string; passwordHash?: string } = { name: data.name, email: data.email };
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

  const adminCommissionUpdate =
    session.role === 'COMPANY_ADMIN' && typeof data.commissionPercent === 'number'
      ? { commissionPercent: Math.min(100, Math.max(0, data.commissionPercent)) }
      : {};

  await prisma.professional.update({
    where: { id },
    data: {
      name: data.name,
      specialty: data.specialty,
      photoUrl: data.photoUrl,
      ratingAverage: data.ratingAverage,
      email: data.email || prof.email,
      userId,
      ...adminCommissionUpdate,
    }
  });

  revalidatePath('/app/profissionais');
  revalidatePath('/app/relatorios');
  return { success: true };
}
