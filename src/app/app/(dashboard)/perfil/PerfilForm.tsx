'use client';

import { useState } from 'react';
import { updateProfessional } from '@/app/actions/professionals';
import type { Professional } from '@prisma/client';

export default function PerfilForm({ professional }: { professional: Professional }) {
  const [photoUrl, setPhotoUrl] = useState(professional.photoUrl || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    try {
      await updateProfessional(professional.id, { 
        name: professional.name, 
        specialty: professional.specialty || '', 
        photoUrl,
        ratingAverage: professional.ratingAverage ?? undefined
      });
      setMessage('Foto de perfil atualizada com sucesso!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error(error);
      setMessage('Erro ao atualizar foto.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <div style={{ 
          width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#27272A',
          backgroundImage: photoUrl ? `url(${photoUrl})` : 'none',
          backgroundSize: 'cover', backgroundPosition: 'center',
          border: '2px solid var(--primary)'
        }}></div>
        
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>
            URL da Foto de Perfil
          </label>
          <input 
            type="url" 
            className="input" 
            value={photoUrl} 
            onChange={e => setPhotoUrl(e.target.value)} 
            placeholder="Cole o link da sua foto (https://...)" 
            style={{ width: '100%', marginBottom: '1rem' }}
          />
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar Foto'}
          </button>
          {message && <span style={{ marginLeft: '1rem', color: message.includes('Erro') ? 'var(--danger)' : 'var(--success)' }}>{message}</span>}
        </div>
      </div>
    </form>
  );
}
