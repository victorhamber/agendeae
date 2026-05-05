'use client';

import { useState } from 'react';
import { updateProfessional } from '@/app/actions/professionals';
import type { Professional } from '@prisma/client';
import styles from '../../app.module.css';

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
    <form onSubmit={handleSubmit} className={styles.perfilForm}>
      <div className={styles.perfilFormRow}>
        <div className={styles.perfilFormAvatar}>
          {photoUrl ? (
            <img src={photoUrl} alt="" className={styles.perfilFormAvatarImg} />
          ) : null}
        </div>

        <div className={styles.perfilFormFields}>
          <label className={styles.perfilFormLabel} htmlFor="perfil-photo-url">
            URL da Foto de Perfil
          </label>
          <input
            id="perfil-photo-url"
            type="url"
            className={`input ${styles.perfilFormInputFull}`}
            value={photoUrl}
            onChange={e => setPhotoUrl(e.target.value)}
            placeholder="Cole o link da sua foto (https://...)"
          />
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar Foto'}
          </button>
          {message && (
            <span
              className={`${styles.perfilFormMessage} ${
                message.includes('Erro') ? styles.perfilFormMessageErr : styles.perfilFormMessageOk
              }`}
            >
              {message}
            </span>
          )}
        </div>
      </div>
    </form>
  );
}
