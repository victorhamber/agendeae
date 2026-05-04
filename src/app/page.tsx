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

  redirect('/app/login');
}
