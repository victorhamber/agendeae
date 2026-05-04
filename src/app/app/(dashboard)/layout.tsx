import styles from '../app.module.css';
import AppSidebar from './AppSidebar';
import { requireCompanySession } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireCompanySession();
  const [user, license] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.sub },
      select: { email: true },
    }),
    prisma.license.findFirst({
      where: { companyId: session.companyId },
      orderBy: [{ expiresAt: 'desc' }, { trialEndsAt: 'desc' }],
      include: { plan: true },
    }),
  ]);

  return (
    <div className={styles.container}>
      <AppSidebar
        role={session.role}
        email={user?.email ?? ''}
        planName={license?.plan?.name ?? ''}
      />
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
