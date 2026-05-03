'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '../super-admin.module.css';

export default function SuperAdminSidebar() {
  const pathname = usePathname();

  // Esconder a sidebar se estiver na tela de login
  if (pathname === '/super-admin/login' || pathname === '/login') {
    return null;
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>AGENDAAE Admin</div>
      <nav className={styles.nav}>
        <Link href="/" className={styles.navLink}>Dashboard</Link>
        <Link href="/planos" className={styles.navLink}>Planos</Link>
        <Link href="/licencas" className={styles.navLink}>Empresas / Licenças</Link>
      </nav>
    </aside>
  );
}
