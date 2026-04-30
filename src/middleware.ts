import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  
  const hostname = request.headers.get('host') || '';

  // Ignorar arquivos estáticos, _next e API routes
  if (url.pathname.startsWith('/_next') || url.pathname.startsWith('/api') || url.pathname.includes('.')) {
    return NextResponse.next();
  }

  // ─────────────────────────────────────────────
  // 1. SUPER ADMIN: adm.agendeae.com.br
  // ─────────────────────────────────────────────
  if (hostname.startsWith('adm.')) {
    const hasAuthToken = request.cookies.has('auth_token');
    if (!hasAuthToken && url.pathname !== '/login') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (url.pathname === '/') {
      return NextResponse.rewrite(new URL('/super-admin', request.url));
    }
    return NextResponse.rewrite(new URL(`/super-admin${url.pathname}`, request.url));
  }

  // ─────────────────────────────────────────────
  // 2. ADMIN / PROFISSIONAL: app.agendeae.com.br
  //    100% bloqueado — exige login em TODAS as rotas
  // ─────────────────────────────────────────────
  if (hostname.startsWith('app.')) {
    const hasAuthToken = request.cookies.has('auth_token');
    if (!hasAuthToken && url.pathname !== '/login') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (url.pathname === '/') {
      return NextResponse.rewrite(new URL('/app', request.url));
    }
    return NextResponse.rewrite(new URL(`/app${url.pathname}`, request.url));
  }

  // ─────────────────────────────────────────────
  // 3. DOMÍNIO PRINCIPAL: agendeae.com.br
  //    Aqui ficam APENAS as páginas PÚBLICAS de agendamento
  // ─────────────────────────────────────────────

  // Bloquear qualquer acesso direto a /app ou /super-admin pelo domínio principal
  if (url.pathname.startsWith('/app') || url.pathname.startsWith('/super-admin')) {
    // Redirecionar para o subdomínio correto
    const baseDomain = hostname.replace('www.', '');
    if (url.pathname.startsWith('/super-admin')) {
      return NextResponse.redirect(new URL('/login', `http://adm.${baseDomain}`));
    }
    return NextResponse.redirect(new URL('/login', `http://app.${baseDomain}`));
  }

  // Raiz do domínio principal → redirect para login do painel
  if (url.pathname === '/') {
    const baseDomain = hostname.replace('www.', '');
    return NextResponse.redirect(new URL('/login', `http://app.${baseDomain}`));
  }

  // Qualquer outro caminho no domínio principal (ex: /joaobarbeiro)
  // → Rewrite para /agenda/joaobarbeiro (página pública de agendamento)
  // Exceto se já começa com /agenda (acesso direto)
  if (!url.pathname.startsWith('/agenda')) {
    return NextResponse.rewrite(new URL(`/agenda${url.pathname}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|uploads).*)',
  ],
};
