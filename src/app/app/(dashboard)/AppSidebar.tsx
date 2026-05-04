'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '../app.module.css';
import { logout } from '@/app/actions/auth';

export default function AppSidebar({ 
  role,
  email,
  planName,
}: { 
  role: 'COMPANY_ADMIN' | 'PROFESSIONAL';
  email: string;
  planName: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close menu when route changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOpen(false);
  }, [pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (pathname === '/app/login' || pathname === '/login') {
    return null;
  }

  const navLinks = [
    ...(role === 'COMPANY_ADMIN' ? [{ href: '/', label: 'Dashboard' }] : []),
    { href: '/agenda', label: 'Agenda' },
    ...(role === 'PROFESSIONAL' ? [{ href: '/perfil', label: 'Meu Perfil' }] : []),
    ...(role === 'COMPANY_ADMIN' ? [
      { href: '/servicos', label: 'Serviços' },
      { href: '/profissionais', label: 'Profissionais' },
      { href: '/clientes', label: 'Clientes' },
      { href: '/relatorios', label: 'Relatórios' },
      { href: '/configuracoes', label: 'Configurações' }
    ] : [])
  ];

  const initial = (email?.trim()?.[0] || 'U').toUpperCase();
  const displayPlan = planName?.trim() || '—';

  return (
    <>
      {/* Mobile Top Bar */}
      <div className={styles.mobileTopBar}>
        <div className={styles.brand}>Minha Empresa</div>
        <button 
          className={styles.hamburgerButton}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          )}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className={styles.mobileBackdrop} 
          onClick={() => setIsOpen(false)} 
        />
      )}

      {/* Sidebar Content */}
      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.desktopBrand}>Minha Empresa</div>
        
        <nav className={styles.nav}>
          {navLinks.map(link => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href} 
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className={styles.accountCardWrap}>
          <Link href="/conta" className={styles.accountCard}>
            <div className={styles.accountAvatar} aria-hidden="true">
              {initial}
            </div>
            <div className={styles.accountMeta}>
              <div className={styles.accountEmail} title={email}>
                {email || 'Minha conta'}
              </div>
              <div className={styles.accountPlan}>
                {displayPlan}
              </div>
            </div>
          </Link>

          <form action={logout} className={styles.accountLogoutForm}>
            <button type="submit" className={styles.accountLogoutButton}>
              Sair da conta
            </button>
          </form>
        </div>
        

      </aside>
    </>
  );
}
