'use client';

import { useActionState, useEffect } from 'react';
import { loginTenant } from '@/app/actions/auth';
import styles from './login.module.css';

export default function TenantLogin() {
  const [state, action, isPending] = useActionState(loginTenant, null);

  useEffect(() => {
    if (state?.success) {
      window.location.href = '/';
    }
  }, [state?.success]);
  return (
    <div className={styles.page}>
      <div className={`glass ${styles.card}`}>
        <h1 className={styles.title}>Acesso à Empresa</h1>
        <p className={styles.subtitle}>Entre com suas credenciais de administrador ou profissional.</p>
        
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
              placeholder="Seu e-mail" 
              className="input" 
              required 
              disabled={isPending}
            />
          </div>
          <div>
            <input 
              name="password" 
              type="password" 
              placeholder="Sua senha" 
              className="input" 
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
            {isPending ? 'Entrando...' : 'Entrar no Painel'}
          </button>
        </form>
        
        <div className={styles.footer}>
          <p>Esta é uma tela de login de demonstração.</p>
        </div>
      </div>
    </div>
  );
}
