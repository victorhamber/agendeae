'use server';

import { prisma } from '@/lib/prisma';
import { requireSuperAdminSession } from '@/lib/auth/server';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export async function createLicense(formData: FormData) {
  try {
    await requireSuperAdminSession();

    const customerName = String(formData.get('customerName') || '').trim();
    const customerEmail = String(formData.get('customerEmail') || '').trim().toLowerCase();
    const customerPassword = String(formData.get('customerPassword') || '');

    const planId = String(formData.get('planId') || '');
    const status = String(formData.get('status') || 'ACTIVE');
    const startsAtStr = String(formData.get('startsAt') || '');
    const expiresAtStr = String(formData.get('expiresAt') || '');
    const trialEndsAtStr = String(formData.get('trialEndsAt') || '');

    if (!customerName || !customerEmail || !customerPassword || !planId || !startsAtStr) {
      return { success: false, error: 'Preencha todos os campos obrigatórios.' };
    }

    const startsAt = new Date(startsAtStr);
    if (isNaN(startsAt.getTime())) {
      return { success: false, error: 'Data de início inválida.' };
    }

    const existingUser = await prisma.user.findUnique({ where: { email: customerEmail } });
    if (existingUser) {
      return { success: false, error: 'Este e-mail já está em uso por outro usuário.' };
    }

    const passwordHash = await bcrypt.hash(customerPassword, 10);
    const tempSlug = `empresa-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: customerName,
          email: customerEmail,
          passwordHash,
          role: 'COMPANY_ADMIN',
          status: 'ACTIVE',
        }
      });

      const company = await tx.company.create({
        data: {
          name: `Empresa de ${customerName}`,
          slug: tempSlug,
          ownerId: user.id,
          status: 'ACTIVE',
        }
      });

      await tx.license.create({
        data: {
          companyId: company.id,
          planId,
          status,
          startsAt,
          expiresAt: expiresAtStr ? new Date(expiresAtStr) : null,
          trialEndsAt: trialEndsAtStr ? new Date(trialEndsAtStr) : null,
        },
      });
    });

    revalidatePath('/licencas');
    return { success: true };

  } catch (error: any) {
    console.error('Erro ao criar licença:', error);
    return { 
      success: false, 
      error: error.message || 'Erro interno no servidor ao processar a licença.' 
    };
  }
}

export async function updateLicenseStatus(id: string, status: string) {
  try {
    await requireSuperAdminSession();

    await prisma.license.update({
      where: { id },
      data: { status },
    });

    if (status === 'BLOCKED' || status === 'CANCELLED') {
      const license = await prisma.license.findUnique({ where: { id }, select: { companyId: true } });
      if (license) {
        await prisma.company.update({
          where: { id: license.companyId },
          data: { status: status === 'BLOCKED' ? 'BLOCKED' : 'CANCELLED' },
        });
      }
    }

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
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateLicenseExpiry(id: string, expiresAt: string) {
  try {
    await requireSuperAdminSession();

    await prisma.license.update({
      where: { id },
      data: { expiresAt: expiresAt ? new Date(expiresAt) : null },
    });

    revalidatePath('/licencas');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteLicense(id: string) {
  try {
    await requireSuperAdminSession();

    const license = await prisma.license.findUnique({
      where: { id },
      include: { company: true },
    });

    if (!license) return { success: false, error: 'Licença não encontrada.' };

    const companyId = license.companyId;
    const ownerId = license.company.ownerId;

    await prisma.$transaction(async (tx) => {
      await tx.appointment.deleteMany({ where: { companyId } });
      await tx.bookingRule.deleteMany({ where: { companyId } });
      await tx.professionalService.deleteMany({ where: { companyId } });
      await tx.blockedTime.deleteMany({ where: { companyId } });
      await tx.availability.deleteMany({ where: { companyId } });
      await tx.professional.deleteMany({ where: { companyId } });
      await tx.service.deleteMany({ where: { companyId } });
      await tx.customer.deleteMany({ where: { companyId } });
      await tx.license.delete({ where: { id } });
      await tx.company.delete({ where: { id: companyId } });
      await tx.user.delete({ where: { id: ownerId } });
    });

    revalidatePath('/licencas');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
