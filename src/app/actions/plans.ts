'use server';

import { prisma } from '@/lib/prisma';
import { requireSuperAdminSession } from '@/lib/auth/server';
import { revalidatePath } from 'next/cache';

export async function createPlan(formData: FormData) {
  await requireSuperAdminSession();

  await prisma.plan.create({
    data: {
      name: String(formData.get('name')),
      description: String(formData.get('description') || ''),
      priceMonthly: parseFloat(String(formData.get('priceMonthly') || '0')),
      priceYearly: parseFloat(String(formData.get('priceYearly') || '0')),
      maxProfessionals: parseInt(String(formData.get('maxProfessionals') || '1')),
      maxUnits: parseInt(String(formData.get('maxUnits') || '1')),
      allowReports: formData.get('allowReports') === 'on',
      allowWhatsappReminders: formData.get('allowWhatsappReminders') === 'on',
      allowCustomDomain: formData.get('allowCustomDomain') === 'on',
      allowMultipleUsers: formData.get('allowMultipleUsers') === 'on',
      status: 'ACTIVE',
    },
  });

  revalidatePath('/planos');
  return { success: true };
}

export async function updatePlan(id: string, formData: FormData) {
  await requireSuperAdminSession();

  await prisma.plan.update({
    where: { id },
    data: {
      name: String(formData.get('name')),
      description: String(formData.get('description') || ''),
      priceMonthly: parseFloat(String(formData.get('priceMonthly') || '0')),
      priceYearly: parseFloat(String(formData.get('priceYearly') || '0')),
      maxProfessionals: parseInt(String(formData.get('maxProfessionals') || '1')),
      maxUnits: parseInt(String(formData.get('maxUnits') || '1')),
      allowReports: formData.get('allowReports') === 'on',
      allowWhatsappReminders: formData.get('allowWhatsappReminders') === 'on',
      allowCustomDomain: formData.get('allowCustomDomain') === 'on',
      allowMultipleUsers: formData.get('allowMultipleUsers') === 'on',
    },
  });

  revalidatePath('/planos');
  return { success: true };
}

export async function togglePlanStatus(id: string) {
  await requireSuperAdminSession();
  const plan = await prisma.plan.findUnique({ where: { id } });
  if (!plan) throw new Error('Plano não encontrado');

  await prisma.plan.update({
    where: { id },
    data: { status: plan.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' },
  });

  revalidatePath('/planos');
  return { success: true };
}
