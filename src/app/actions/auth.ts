'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signSession, getSessionCookieName } from '@/lib/auth/session';
import { loginRedirectPath } from '@/lib/auth/server';
import type { SessionPayload, UserRole } from '@/lib/auth/types';

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
export type ChangePasswordState = { error?: string; success?: boolean } | null;

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

    // Redirecionar será feito pelo cliente
    return { success: true };
  } catch (error: any) {
    if (error.digest?.startsWith('NEXT_REDIRECT')) throw error;
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

    return { success: true };
  } catch (error: any) {
    if (error.digest?.startsWith('NEXT_REDIRECT')) throw error;
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
  redirect(await loginRedirectPath());
}

export async function changePassword(prevState: ChangePasswordState, formData: FormData): Promise<ChangePasswordState> {
  const currentPassword = String(formData.get('currentPassword') || '');
  const newPassword = String(formData.get('newPassword') || '');
  const confirmPassword = String(formData.get('confirmPassword') || '');

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: 'Preencha todos os campos' };
  }
  if (newPassword !== confirmPassword) {
    return { error: 'A confirmação da nova senha não confere' };
  }
  if (newPassword.length < 8) {
    return { error: 'A nova senha deve ter pelo menos 8 caracteres' };
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(getSessionCookieName())?.value;
    if (!token) return { error: 'Sessão expirada. Faça login novamente.' };

    const { verifySession } = await import('@/lib/auth/session');
    const session = await verifySession(token);

    const user = await prisma.user.findUnique({
      where: { id: session.sub },
      select: { id: true, passwordHash: true, status: true },
    });
    if (!user || user.status !== 'ACTIVE') return { error: 'Usuário inválido' };

    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) return { error: 'Senha atual incorreta' };

    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
      select: { id: true },
    });

    return { success: true };
  } catch (error: any) {
    console.error('Change password error:', error);
    return { error: error.message || 'Erro ao alterar senha' };
  }
}
