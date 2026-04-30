import styles from '../app.module.css';
import { getMockAuth } from '@/app/actions/auth';
import AppSidebar from './AppSidebar';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role } = await getMockAuth();

  return (
    <div className={styles.container}>
      <AppSidebar role={role} />
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
