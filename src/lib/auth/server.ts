import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { SessionPayload, UserRole } from './types';
import { getSessionCookieName, verifySession } from './session';

export async function getServerSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  if (!token) return null;

  try {
    return await verifySession(token);
  } catch {
    return null;
  }
}

export async function requireServerSession(): Promise<SessionPayload> {
  const session = await getServerSession();
  if (!session) redirect('/login');
  return session;
}

export async function requireRole(roles: UserRole[]) {
  const session = await requireServerSession();
  if (!roles.includes(session.role)) redirect('/login');
  return session;
}

export async function requireCompanySession() {
  const session = await requireRole(['COMPANY_ADMIN', 'PROFESSIONAL']);
  if (!session.companyId) redirect('/login');
  return session as SessionPayload & { companyId: string; role: Extract<UserRole, 'COMPANY_ADMIN' | 'PROFESSIONAL'> };
}

export async function requireSuperAdminSession() {
  return await requireRole(['SUPER_ADMIN']);
}

