import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionCookieName } from '@/lib/auth/session';

export async function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // 1. Ignorar arquivos estáticos, _next e API routes
  if (url.pathname.startsWith('/_next') || url.pathname.startsWith('/api') || url.pathname.includes('.')) {
    return NextResponse.next();
  }

  // 2. Ignorar Server Actions
  if (request.method === 'POST') {
    return NextResponse.next();
  }

  // ─────────────────────────────────────────────
  // 3. SUPER ADMIN: adm.agendeae.com.br
  // ─────────────────────────────────────────────
  if (hostname.startsWith('adm.')) {
    if (url.pathname === '/') {
      return NextResponse.rewrite(new URL('/super-admin', request.url));
    }
    // Se não estiver logado e não for a tela de login, o requireSuperAdminSession na página vai cuidar disso
    return NextResponse.rewrite(new URL(`/super-admin${url.pathname}`, request.url));
  }

  // ─────────────────────────────────────────────
  // 4. ADMIN / PROFISSIONAL: app.agendeae.com.br
  // ─────────────────────────────────────────────
  if (hostname.startsWith('app.')) {
    if (url.pathname === '/') {
      return NextResponse.rewrite(new URL('/app', request.url));
    }
    return NextResponse.rewrite(new URL(`/app${url.pathname}`, request.url));
  }

  // ─────────────────────────────────────────────
  // 5. DOMÍNIO PRINCIPAL: agendeae.com.br (Páginas Públicas)
  // ─────────────────────────────────────────────
  
  // Bloquear acesso direto a pastas internas pelo domínio principal
  if (url.pathname.startsWith('/app') || url.pathname.startsWith('/super-admin')) {
    const baseDomain = hostname.replace('www.', '');
    const sub = url.pathname.startsWith('/super-admin') ? 'adm' : 'app';
    return NextResponse.redirect(new URL('/login', `https://${sub}.${baseDomain}`));
  }

  // Raiz do domínio principal redireciona para o login do app
  if (url.pathname === '/') {
    const baseDomain = hostname.replace('www.', '');
    return NextResponse.redirect(new URL('/login', `https://app.${baseDomain}`));
  }

  // Rewrite para página pública de agendamento
  if (!url.pathname.startsWith('/agenda')) {
    return NextResponse.rewrite(new URL(`/agenda${url.pathname}`, request.url));
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|uploads).*)',
  ],
};
