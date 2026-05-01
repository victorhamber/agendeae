import styles from '../app.module.css';
import AppSidebar from './AppSidebar';
import { requireCompanySession } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireCompanySession();

  return (
    <div className={styles.container}>
      <AppSidebar role={session.role} />
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
