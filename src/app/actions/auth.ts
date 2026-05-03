'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signSession, getSessionCookieName } from '@/lib/auth/session';
import type { SessionPayload, UserRole } from '@/lib/auth/types';
import { isRedirectError } from 'next/dist/client/components/redirect';

function normalizeRole(role: string): UserRole {
  if (role === 'SUPER_ADMIN' || role === 'COMPANY_ADMIN' || role === 'PROFESSIONAL') return role;
  // compat: dados antigos que gravavam ADMIN
  if (role === 'ADMIN') return 'COMPANY_ADMIN';
  throw new Error('Role inválida');
}

async function buildSessionForUser(userId: string, role: UserRole): Promise<SessionPayload> {
  if (role === 'SUPER_ADMIN') return { sub: userId, role };

  if (role === 'PROFESSIONAL') {
    const professional = await prisma.professional.findUnique({
      where: { userId: userId },
      select: { id: true, companyId: true, status: true },
    });
    if (!professional || professional.status !== 'ACTIVE') throw new Error('Profissional não encontrado ou inativo');
    return { sub: userId, role, companyId: professional.companyId, professionalId: professional.id };
  }

  const company = await prisma.company.findFirst({
    where: { ownerId: userId, status: 'ACTIVE' },
    select: { id: true },
  });
  if (!company) throw new Error('Empresa não encontrada para este usuário');
  return { sub: userId, role, companyId: company.id };
}

export type LoginState = { error?: string; success?: boolean } | null;

export async function loginTenant(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');
  
  if (!email || !password) {
    return { error: 'Informe e-mail e senha' };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, passwordHash: true, role: true, status: true },
    });

    if (!user || user.status !== 'ACTIVE') {
      return { error: 'Credenciais inválidas' };
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return { error: 'Credenciais inválidas' };
    }

    const role = normalizeRole(user.role);
    if (role === 'SUPER_ADMIN') {
      return { error: 'Use o login do Super Admin' };
    }

    const sessionPayload = await buildSessionForUser(user.id, role);
    const token = await signSession(sessionPayload, '7d');

    const cookieStore = await cookies();
    cookieStore.set(getSessionCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    // compat: remove cookies antigas
    cookieStore.delete('auth_token');
    cookieStore.delete('mockRole');
    cookieStore.delete('mockProfessionalId');

    // Redirecionar direto pelo servidor
    redirect('/');
  } catch (error: any) {
    if (isRedirectError(error)) throw error;
    console.error('Login error:', error);
    return { error: error.message || 'Erro ao realizar login' };
  }
}

export async function loginSuperAdmin(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');
  
  if (!email || !password) {
    return { error: 'Informe e-mail e senha' };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, passwordHash: true, role: true, status: true },
    });

    if (!user || user.status !== 'ACTIVE') {
      return { error: 'Credenciais inválidas' };
    }
    
    const role = normalizeRole(user.role);
    if (role !== 'SUPER_ADMIN') {
      return { error: 'Sem permissão' };
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return { error: 'Credenciais inválidas' };
    }

    const sessionPayload = await buildSessionForUser(user.id, role);
    const token = await signSession(sessionPayload, '7d');

    const cookieStore = await cookies();
    cookieStore.set(getSessionCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    cookieStore.delete('auth_token');
    cookieStore.delete('mockRole');
    cookieStore.delete('mockProfessionalId');

    redirect('/');
  } catch (error: any) {
    if (isRedirectError(error)) throw error;
    console.error('Super Admin login error:', error);
    return { error: error.message || 'Erro ao realizar login' };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(getSessionCookieName());
  cookieStore.delete('auth_token');
  cookieStore.delete('mockRole');
  cookieStore.delete('mockProfessionalId');
  redirect('/login');
}
