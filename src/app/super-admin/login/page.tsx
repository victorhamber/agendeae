'use client';

import { useActionState, useEffect } from 'react';
import { loginSuperAdmin } from '@/app/actions/auth';
import styles from './login.module.css';

export default function SuperAdminLogin() {
  const [state, action, isPending] = useActionState(loginSuperAdmin, null);

  useEffect(() => {
    if (state?.success) {
      window.location.href = '/';
    }
  }, [state?.success]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Super Admin</h1>
        <p className={styles.subtitle}>Acesso exclusivo à gestão da plataforma.</p>
        
        <form action={action} className={styles.form}>
          {state?.error && (
            <div className={styles.error}>
              {state.error}
            </div>
          )}

          <div>
            <input 
              name="email" 
              type="email" 
              placeholder="E-mail master" 
              className={`input ${styles.darkInput}`}
              required 
              disabled={isPending}
            />
          </div>
          <div>
            <input 
              name="password" 
              type="password" 
              placeholder="Senha mestre" 
              className={`input ${styles.darkInput}`}
              required 
              disabled={isPending}
            />
            <div className={styles.forgotWrap}>
              <a href="#" className={styles.forgotLink}>
                Esqueci minha senha
              </a>
            </div>
          </div>
          <button 
            type="submit" 
            className={`btn-primary ${styles.submit}`}
            disabled={isPending}
          >
            {isPending ? 'Acessando...' : 'Acessar Controle'}
          </button>
        </form>
        
        <div className={styles.footer}>
          <p>Acesso restrito. Monitore licenças e faturamento.</p>
        </div>
      </div>
    </div>
  );
}
