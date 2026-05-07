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

  const isLinkActive = (href: string) => {
    const normalizedHref = href === '/' ? '/super-admin' : `/super-admin${href}`;
    if (href === '/') return pathname === '/super-admin';
    return pathname.startsWith(normalizedHref);
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>AGENDEAE Admin</div>
      <nav className={styles.nav}>
        <Link href="/" className={`${styles.navLink} ${isLinkActive('/') ? styles.navLinkActive : ''}`}>Dashboard</Link>
        <Link href="/planos" className={`${styles.navLink} ${isLinkActive('/planos') ? styles.navLinkActive : ''}`}>Planos</Link>
        <Link href="/licencas" className={`${styles.navLink} ${isLinkActive('/licencas') ? styles.navLinkActive : ''}`}>Licenças</Link>
      </nav>
    </aside>
  );
}
