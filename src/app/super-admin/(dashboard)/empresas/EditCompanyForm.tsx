'use client';

import { useState } from 'react';
import { updateCompany } from '@/app/actions/companies';

type EditCompanyProps = {
  company: {
    id: string;
    name: string;
    slug: string;
    status: string;
  };
};

export default function EditCompanyForm({ company }: EditCompanyProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      formData.append('id', company.id);
      await updateCompany(formData);
      setIsOpen(false);
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar empresa');
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} style={{ color: 'var(--primary)', fontWeight: 500, fontSize: '0.875rem' }}>
        Editar
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
        maxWidth: '400px',
        textAlign: 'left'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'var(--foreground)' }}>Editar Empresa</h2>
        
        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '1rem', borderRadius: 'var(--radius)', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--foreground)' }}>Nome da Empresa</label>
            <input name="name" type="text" required defaultValue={company.name} className="input" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--foreground)' }}>Slug (URL Pública)</label>
            <input name="slug" type="text" required defaultValue={company.slug} className="input" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--foreground)' }}>Status</label>
            <select name="status" defaultValue={company.status} className="input">
              <option value="ACTIVE">Ativo</option>
              <option value="TRIAL">Trial</option>
              <option value="BLOCKED">Bloqueado</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
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
              {isLoading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
