'use server';

import { prisma } from '@/lib/prisma';
import { requireCompanySession } from '@/lib/auth/server';
import { revalidatePath } from 'next/cache';

export async function updateCustomerNotes(customerId: string, notes: string) {
  const session = await requireCompanySession();
  
  // Verify customer belongs to the company
  const customer = await prisma.customer.findUnique({
    where: { id: customerId }
  });

  if (!customer || customer.companyId !== session.companyId) {
    throw new Error('Cliente não encontrado ou sem permissão');
  }

  await prisma.customer.update({
    where: { id: customerId },
    data: { notes }
  });

  revalidatePath('/clientes');
  return { success: true };
}
