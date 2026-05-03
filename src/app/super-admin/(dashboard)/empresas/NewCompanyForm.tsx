'use client';

import { useState } from 'react';
import { createCompany } from '@/app/actions/companies';

export default function NewCompanyForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      await createCompany(formData);
      setIsOpen(false);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setError(err.message || 'Erro ao criar empresa');
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="btn-primary">
        Nova Empresa
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50
    }}>
      <div className="glass" style={{
        padding: '2rem',
        borderRadius: 'var(--radius)',
        width: '100%',
        maxWidth: '500px'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Cadastrar Nova Empresa</h2>
        
        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '1rem', borderRadius: 'var(--radius)', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Nome da Empresa</label>
            <input name="name" type="text" required className="input" placeholder="Ex: Barbearia do João" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Slug (URL Pública)</label>
            <input name="slug" type="text" required className="input" placeholder="Ex: barbearia-do-joao" />
          </div>
          
          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1rem 0' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 'bold' }}>Dados do Proprietário</h3>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Nome Completo</label>
            <input name="ownerName" type="text" required className="input" placeholder="Ex: João da Silva" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>E-mail de Acesso</label>
            <input name="ownerEmail" type="email" required className="input" placeholder="Ex: joao@barbearia.com" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Senha Provisória</label>
            <input name="ownerPassword" type="password" required className="input" placeholder="********" />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button 
              type="button" 
              onClick={() => setIsOpen(false)}
              className="btn-primary" 
              style={{ backgroundColor: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)' }}
            >
              Cancelar
            </button>
            <button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? 'Criando...' : 'Criar Empresa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
