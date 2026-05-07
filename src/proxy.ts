import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

function isPublicFile(pathname: string) {
  // Arquivos PWA da raiz (Admin / Super Admin) não devem ser reescritos.
  if (pathname === '/manifest.webmanifest' || pathname === '/manifest.json' || pathname === '/sw.js') return true;

  // Esses arquivos fazem parte do PWA por empresa e precisam passar pelo rewrite
  if (pathname.endsWith('/manifest.webmanifest') || pathname.endsWith('/manifest.json') || pathname.endsWith('/sw.js')) return false;

  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname.startsWith('/uploads') ||
    pathname.includes('.')
  );
}

function rewriteTo(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.rewrite(url);
}

export async function proxy(request: NextRequest) {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;
  if (isPublicFile(pathname)) return NextResponse.next();

  const host = (request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? '').toLowerCase();
  const baseDomain = host.replace(/^www\./, '').replace(/:\d+$/, '');

  // ─────────────────────────────────────────────
  // SUPER ADMIN: adm.agendeae.com.br  → /super-admin/*
  // ─────────────────────────────────────────────
  if (host.startsWith('adm.')) {
    if (pathname === '/login') return rewriteTo(request, '/super-admin/login');
    if (pathname === '/') return rewriteTo(request, '/super-admin');

    if (pathname.startsWith('/super-admin')) return NextResponse.next();
    return rewriteTo(request, `/super-admin${pathname}`);
  }

  // ─────────────────────────────────────────────
  // ADMIN / PROFISSIONAL: app.agendeae.com.br → /app/*
  // ─────────────────────────────────────────────
  if (host.startsWith('app.')) {
    if (pathname === '/login') return rewriteTo(request, '/app/login');
    if (pathname === '/') return rewriteTo(request, '/app');

    if (pathname.startsWith('/app')) return NextResponse.next();
    return rewriteTo(request, `/app${pathname}`);
  }

  // ─────────────────────────────────────────────
  // DOMÍNIO PRINCIPAL (público)
  // ─────────────────────────────────────────────

  // Permitir acesso às rotas internas também pelo domínio principal.
  // Isso evita "quebrar o app" quando subdomínios (app./adm.) não estão configurados.
  if (pathname.startsWith('/app') || pathname.startsWith('/super-admin')) {
    return NextResponse.next();
  }

  // Raiz do domínio principal → site público (não redireciona)
  if (pathname === '/') return NextResponse.next();

  // /login no domínio principal → login do app (sem depender de subdomínio)
  if (pathname === '/login') {
    return rewriteTo(request, '/app/login');
  }

  // Mantém páginas públicas em /agenda/*
  if (!pathname.startsWith('/agenda')) {
    return rewriteTo(request, `/agenda${pathname}`);
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|uploads).*)'],
};

