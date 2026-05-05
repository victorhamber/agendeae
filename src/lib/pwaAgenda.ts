import { headers } from 'next/headers';

/** Origem pública (HTTPS) atrás de proxy — usada em manifest e metadata. */
export function siteOriginFromRequest(req: Request): string {
  const fallback = new URL(req.url);
  const host =
    req.headers.get('x-forwarded-host')?.split(',')[0]?.trim() ?? fallback.host;
  const proto =
    req.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() ??
    (fallback.protocol === 'https:' ? 'https' : 'http');
  return `${proto}://${host}`;
}

export async function siteOriginFromHeaders(): Promise<string> {
  const h = await headers();
  const host = (h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000')
    .split(',')[0]
    .trim();
  const proto = (h.get('x-forwarded-proto') ?? 'http').split(',')[0].trim();
  return `${proto}://${host}`;
}

/** Ícone do PWA: absoluto e HTTPS; evita http:// (mixed content) e paths relativos ao manifest. */
export function resolveAgendaIconUrl(origin: string, logoUrl: string | null | undefined): string {
  const fallback = `${origin}/next.svg`;
  if (!logoUrl) return fallback;
  const t = logoUrl.trim();
  if (!t) return fallback;
  if (t.startsWith('http://')) return fallback;
  if (t.startsWith('https://')) return t;
  if (t.startsWith('/')) return `${origin}${t}`;
  return `${origin}/${t}`;
}

function guessIconMime(src: string): string | undefined {
  const path = src.split('?')[0]?.toLowerCase() ?? '';
  if (path.endsWith('.svg')) return 'image/svg+xml';
  if (path.endsWith('.webp')) return 'image/webp';
  if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'image/jpeg';
  if (path.endsWith('.png')) return 'image/png';
  return undefined;
}

export function buildAgendaManifestJson(opts: {
  origin: string;
  slug: string;
  name: string;
  themeColor: string;
  logoUrl: string | null | undefined;
}) {
  const { origin, slug, name, themeColor, logoUrl } = opts;
  const startUrl = `${origin}/${slug}/`;
  const iconUrl = resolveAgendaIconUrl(origin, logoUrl);
  const iconType = guessIconMime(iconUrl);
  const typeField = iconType ? { type: iconType } : {};

  return {
    id: startUrl,
    name,
    short_name: name.slice(0, 12),
    start_url: startUrl,
    scope: startUrl,
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: themeColor,
    prefer_related_applications: false,
    icons: [
      { src: iconUrl, sizes: '192x192', purpose: 'any', ...typeField },
      { src: iconUrl, sizes: '512x512', purpose: 'any', ...typeField },
      { src: iconUrl, sizes: '512x512', purpose: 'maskable', ...typeField },
    ],
  };
}
