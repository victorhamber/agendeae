'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function setMockRole(role: 'ADMIN' | 'PROFESSIONAL', professionalId?: string) {
  const cookieStore = await cookies();
  cookieStore.set('mockRole', role);
  if (role === 'PROFESSIONAL' && professionalId) {
    cookieStore.set('mockProfessionalId', professionalId);
  } else {
    cookieStore.delete('mockProfessionalId');
  }
}

export async function getMockAuth() {
  const cookieStore = await cookies();
  // By default, if no auth_token exists, we shouldn't return a role natively.
  // But for now, just return what's there.
  const role = cookieStore.get('mockRole')?.value || 'ADMIN';
  const professionalId = cookieStore.get('mockProfessionalId')?.value;
  return { role, professionalId };
}

export async function loginTenant() {
  const cookieStore = await cookies();
  cookieStore.set('mockRole', 'ADMIN');
  cookieStore.set('auth_token', 'tenant_logged_in');
  redirect('/');
}

export async function loginSuperAdmin() {
  const cookieStore = await cookies();
  cookieStore.set('auth_token', 'super_admin_logged_in');
  redirect('/');
}
