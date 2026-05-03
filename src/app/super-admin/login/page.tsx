'use client';

import { useActionState } from 'react';
import { loginSuperAdmin } from '@/app/actions/auth';

export default function SuperAdminLogin() {
  const [state, action, isPending] = useActionState(loginSuperAdmin, null);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#050505' }}>
      <div style={{ backgroundColor: '#111', padding: '2.5rem', borderRadius: '1rem', width: '100%', maxWidth: '400px', textAlign: 'center', border: '1px solid #27272a', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem', color: '#fff' }}>Super Admin</h1>
        <p style={{ color: '#a1a1aa', marginBottom: '2rem', fontSize: '0.875rem' }}>Acesso exclusivo à gestão da plataforma.</p>
        
        <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {state?.error && (
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem', marginBottom: '1rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              {state.error}
            </div>
          )}

          <div>
            <input 
              name="email" 
              type="email" 
              placeholder="E-mail master" 
              className="input" 
              style={{ backgroundColor: '#18181b', color: '#fff', borderColor: '#27272a' }} 
              required 
              disabled={isPending}
            />
          </div>
          <div>
            <input 
              name="password" 
              type="password" 
              placeholder="Senha mestre" 
              className="input" 
              style={{ backgroundColor: '#18181b', color: '#fff', borderColor: '#27272a' }} 
              required 
              disabled={isPending}
            />
            <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
              <a href="#" style={{ fontSize: '0.75rem', color: '#6366f1', textDecoration: 'none', fontWeight: 500 }}>
                Esqueci minha senha
              </a>
            </div>
          </div>
          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', marginTop: '0.5rem', backgroundColor: '#6366f1' }}
            disabled={isPending}
          >
            {isPending ? 'Acessando...' : 'Acessar Controle'}
          </button>
        </form>
        
        <div style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: '#a1a1aa' }}>
          <p>Acesso restrito. Monitore licenças e faturamento.</p>
        </div>
      </div>
    </div>
  );
}
