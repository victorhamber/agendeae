'use client';

import { useActionState, useEffect } from 'react';
import { loginTenant } from '@/app/actions/auth';

export default function TenantLogin() {
  const [state, action, isPending] = useActionState(loginTenant, null);

  useEffect(() => {
    if (state?.success) {
      window.location.href = '/';
    }
  }, [state?.success]);
  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--background)' }}>
      <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Acesso à Empresa</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '2rem', fontSize: '0.875rem' }}>Entre com suas credenciais de administrador ou profissional.</p>
        
        <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {state?.error && (
            <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem', marginBottom: '1rem' }}>
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
            <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
              <a href="#" style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>
                Esqueci minha senha
              </a>
            </div>
          </div>
          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={isPending}
          >
            {isPending ? 'Entrando...' : 'Entrar no Painel'}
          </button>
        </form>
        
        <div style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--muted)' }}>
          <p>Esta é uma tela de login de demonstração.</p>
        </div>
      </div>
    </div>
  );
}
