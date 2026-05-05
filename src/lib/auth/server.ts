import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { SessionPayload, UserRole } from './types';
import { getSessionCookieName, verifySession } from './session';

/** Rota de login conforme o host (app.* vs adm.*). */
export async function loginRedirectPath(): Promise<string> {
  const h = await headers();
  const host = (h.get('x-forwarded-host') ?? h.get('host') ?? '').toLowerCase();
  if (host.startsWith('adm.') || host.startsWith('app.')) return '/login';
  return '/app/login';
}

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
  if (!session) redirect(await loginRedirectPath());
  return session;
}

export async function requireRole(roles: UserRole[]) {
  const session = await requireServerSession();
  if (!roles.includes(session.role)) redirect(await loginRedirectPath());
  return session;
}

export async function requireCompanySession() {
  const session = await requireRole(['COMPANY_ADMIN', 'PROFESSIONAL']);
  if (!session.companyId) redirect(await loginRedirectPath());
  return session as SessionPayload & { companyId: string; role: Extract<UserRole, 'COMPANY_ADMIN' | 'PROFESSIONAL'> };
}

/** Apenas dono da empresa (sem acesso de profissional). */
export async function requireCompanyAdminSession() {
  const session = await requireRole(['COMPANY_ADMIN']);
  if (!session.companyId) redirect(await loginRedirectPath());
  return session as SessionPayload & { companyId: string; role: 'COMPANY_ADMIN' };
}

export async function requireSuperAdminSession() {
  return await requireRole(['SUPER_ADMIN']);
}

