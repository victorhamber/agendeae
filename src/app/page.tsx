import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth/server';

export default async function Home() {
  const h = await headers();
  const host = (h.get('x-forwarded-host') ?? h.get('host') ?? '').toLowerCase();

  if (host.startsWith('app.')) {
    const session = await getServerSession();
    if (session?.role === 'COMPANY_ADMIN' || session?.role === 'PROFESSIONAL') {
      redirect('/app');
    }
    redirect('/app/login');
  }

  if (host.startsWith('adm.')) {
    const session = await getServerSession();
    if (session?.role === 'SUPER_ADMIN') {
      redirect('/super-admin');
    }
    redirect('/super-admin/login');
  }

  // Domínio principal: páginas públicas ficam em /<slug> (rewritten para /agenda/<slug> via proxy).
  // Mantemos a raiz como "home" pública básica (por enquanto).
  return (
    <main className="pagePad">
      <h1>AGENDAAE</h1>
      <p>Acesse pelo link da sua empresa: https://agendeae.com.br/seuslug</p>
    </main>
  );
}
