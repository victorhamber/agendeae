import Link from 'next/link';
import styles from '../super-admin.module.css';

import SuperAdminSidebar from './SuperAdminSidebar';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.container}>
      <SuperAdminSidebar />
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
