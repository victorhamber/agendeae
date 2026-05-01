'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireCompanySession } from '@/lib/auth/server';

export async function updateCompanyInfo(data: {
  name: string;
  description: string;
  slug: string;
  primaryColor: string;
  logoUrl?: string;
  coverUrl?: string;
  whatsapp?: string;
  instagram?: string;
  address?: string;
  segment?: string;
}) {
  const session = await requireCompanySession();
  // Validar slug: apenas letras minúsculas, números e hífens
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!slugRegex.test(data.slug)) {
    throw new Error('O slug deve conter apenas letras minúsculas, números e hífens.');
  }

  // Verificar unicidade do slug (excluindo a própria empresa)
  const existingCompany = await prisma.company.findFirst({
    where: {
      slug: data.slug,
      id: { not: session.companyId }
    }
  });

  if (existingCompany) {
    throw new Error('Este link já está em uso por outra empresa. Escolha outro.');
  }

  await prisma.company.update({
    where: { id: session.companyId },
    data: {
      name: data.name,
      description: data.description,
      slug: data.slug,
      primaryColor: data.primaryColor,
      logoUrl: data.logoUrl,
      coverUrl: data.coverUrl,
      whatsapp: data.whatsapp,
      instagram: data.instagram,
      address: data.address,
      segment: data.segment,
    }
  });

  revalidatePath('/app/configuracoes');
  revalidatePath(`/agenda/${data.slug}`);
  return { success: true };
}

export async function checkSlugAvailability(slug: string) {
  const session = await requireCompanySession();
  const existing = await prisma.company.findFirst({
    where: {
      slug,
      id: { not: session.companyId }
    }
  });
  return { available: !existing };
}
