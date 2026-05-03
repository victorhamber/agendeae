'use server';

import { prisma } from '@/lib/prisma';
import { requireSuperAdminSession } from '@/lib/auth/server';
import { revalidatePath } from 'next/cache';

export async function createLicense(formData: FormData) {
  await requireSuperAdminSession();

  const companyId = String(formData.get('companyId'));
  const planId = String(formData.get('planId'));
  const status = String(formData.get('status') || 'ACTIVE');
  const startsAt = new Date(String(formData.get('startsAt')));
  const expiresAtStr = String(formData.get('expiresAt') || '');
  const trialEndsAtStr = String(formData.get('trialEndsAt') || '');

  await prisma.license.create({
    data: {
      companyId,
      planId,
      status,
      startsAt,
      expiresAt: expiresAtStr ? new Date(expiresAtStr) : null,
      trialEndsAt: trialEndsAtStr ? new Date(trialEndsAtStr) : null,
    },
  });

  revalidatePath('/licencas');
  return { success: true };
}

export async function updateLicenseStatus(id: string, status: string) {
  await requireSuperAdminSession();

  await prisma.license.update({
    where: { id },
    data: { status },
  });

  // Se bloqueou a licença, bloquear a empresa também
  if (status === 'BLOCKED' || status === 'CANCELLED') {
    const license = await prisma.license.findUnique({ where: { id }, select: { companyId: true } });
    if (license) {
      await prisma.company.update({
        where: { id: license.companyId },
        data: { status: status === 'BLOCKED' ? 'BLOCKED' : 'CANCELLED' },
      });
    }
  }

  // Se ativou, ativar a empresa
  if (status === 'ACTIVE') {
    const license = await prisma.license.findUnique({ where: { id }, select: { companyId: true } });
    if (license) {
      await prisma.company.update({
        where: { id: license.companyId },
        data: { status: 'ACTIVE' },
      });
    }
  }

  revalidatePath('/licencas');
  return { success: true };
}

export async function updateLicenseExpiry(id: string, expiresAt: string) {
  await requireSuperAdminSession();

  await prisma.license.update({
    where: { id },
    data: { expiresAt: expiresAt ? new Date(expiresAt) : null },
  });

  revalidatePath('/licencas');
  return { success: true };
}
