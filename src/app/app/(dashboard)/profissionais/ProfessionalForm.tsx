'use client';

import { useState, useRef } from 'react';
import { createProfessional, updateProfessional } from '@/app/actions/professionals';
import type { Professional } from '@prisma/client';
import styles from '../../app.module.css';

export default function ProfessionalForm({ professional }: { professional?: Professional }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(professional?.name || '');
  const [specialty, setSpecialty] = useState(professional?.specialty || '');
  const [photoUrl, setPhotoUrl] = useState(professional?.photoUrl || '');
  const [photoPreview, setPhotoPreview] = useState(professional?.photoUrl || '');
  const [ratingAverage, setRatingAverage] = useState(professional?.ratingAverage || 5.0);
  const [commissionPercent, setCommissionPercent] = useState(professional?.commissionPercent ?? 0);
  const [email, setEmail] = useState(professional?.email || '');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        setPhotoUrl(data.url);
        setPhotoPreview(data.url);
      } else {
        alert(data.error || 'Erro no upload');
        setPhotoPreview(professional?.photoUrl || '');
      }
    } catch {
      alert('Erro ao enviar imagem');
      setPhotoPreview(professional?.photoUrl || '');
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = () => {
    setPhotoUrl('');
    setPhotoPreview('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (professional) {
        await updateProfessional(professional.id, { 
          name, specialty, photoUrl, ratingAverage: Number(ratingAverage), 
          email: email || undefined, 
          password: password || undefined,
          commissionPercent: Number(commissionPercent),
        });
      } else {
        await createProfessional({ 
          name, specialty, 
          email: email || undefined, 
          password: password || undefined,
          commissionPercent: Number(commissionPercent),
        });
      }
      setIsOpen(false);
      if (!professional) {
        setName('');
        setSpecialty('');
        setPhotoUrl('');
        setPhotoPreview('');
        setRatingAverage(5.0);
        setCommissionPercent(0);
        setEmail('');
        setPassword('');
      }
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'Erro ao salvar profissional';
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    if (professional) {
      return (
        <button type="button" onClick={() => setIsOpen(true)} className={styles.profFormEditLinkBtn}>
          Editar
        </button>
      );
    }
    return (
      <button className="btn-primary" onClick={() => setIsOpen(true)}>
        + Novo Profissional
      </button>
    );
  }

  return (
    <>
      <div
        role="presentation"
        onClick={() => setIsOpen(false)}
        className={styles.profFormModalBackdrop}
      />

      <div className={styles.profFormModalPanel}>
        <div className={styles.profFormModalHeader}>
          <h3 className={styles.profFormModalTitle}>{professional ? 'Editar Profissional' : 'Novo Profissional'}</h3>
          <button type="button" onClick={() => setIsOpen(false)} className={styles.profFormModalClose} aria-label="Fechar">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.profFormForm}>
          <div className={styles.profFormPhotoRow}>
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileRef.current?.click();
                }
              }}
              className={styles.profFormAvatarCircle}
            >
              {photoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoPreview} alt="Foto" className={styles.imagePreviewImg} />
              ) : (
                <span className={styles.imageEmptyIcon}>👤</span>
              )}
              {isUploading && (
                <div className={styles.uploadOverlay}>
                  ...
                </div>
              )}
            </div>
            <div className={styles.imageActions}>
              <button type="button" onClick={() => fileRef.current?.click()} className={styles.imageActionBtn}>
                {photoPreview ? 'Trocar Foto' : 'Enviar Foto'}
              </button>
              {photoPreview && (
                <button type="button" onClick={removePhoto} className={`${styles.imageActionBtn} ${styles.imageRemoveBtn}`}>
                  Remover
                </button>
              )}
              <span className={styles.profFormPhotoHint}>Quadrado 400×400px. JPG, PNG ou WebP.</span>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              aria-label="Selecionar foto do profissional"
              onChange={handleImageUpload}
              className={styles.hiddenInput}
            />
          </div>

          <div className={styles.profFormGrid2}>
            <div>
              <label className={styles.profFormLabel} htmlFor="prof-form-name">Nome</label>
              <input id="prof-form-name" type="text" className="input" required value={name} onChange={e => setName(e.target.value)} placeholder="Ex: João Barbeiro" />
            </div>
            <div>
              <label className={styles.profFormLabel} htmlFor="prof-form-specialty">Especialidade</label>
              <input id="prof-form-specialty" type="text" className="input" required value={specialty} onChange={e => setSpecialty(e.target.value)} placeholder="Ex: Degrade" />
            </div>
          </div>

          <div className={styles.profFormDividerBlock}>
            <h4 className={styles.profFormSectionTitle}>Dados de Acesso (Login)</h4>
            <div className={styles.profFormGrid2}>
              <div>
                <label className={styles.profFormLabel} htmlFor="prof-form-email">E-mail</label>
                <input id="prof-form-email" type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} placeholder="profissional@empresa.com" />
              </div>
              <div>
                <label className={styles.profFormLabel} htmlFor="prof-form-password">{professional ? 'Nova Senha' : 'Senha'}</label>
                <input id="prof-form-password" type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} placeholder="******" />
              </div>
            </div>
          </div>

          <div>
            <label className={styles.profFormLabel} htmlFor="prof-form-commission">
              Repasse ao profissional (% do valor do serviço)
            </label>
            <input
              id="prof-form-commission"
              type="number"
              step="1"
              min="0"
              max="100"
              className={`input ${styles.profFormInputNarrow}`}
              required
              value={commissionPercent}
              onChange={e => setCommissionPercent(Number(e.target.value))}
              aria-label="Percentual de repasse ao profissional"
            />
            <p className={styles.profFormHelpText}>
              Ex.: 40 = 40% do valor bruto do atendimento para o profissional; o restante é receita líquida da empresa.
              0% = 100% fica na empresa até você definir o repasse.
            </p>
          </div>

          <div>
            <label className={styles.profFormLabel} htmlFor="prof-form-rating">Avaliação (Estrelas)</label>
            <input
              id="prof-form-rating"
              type="number"
              step="0.1"
              min="0"
              max="5"
              className={`input ${styles.profFormInputNarrow}`}
              required
              value={ratingAverage}
              onChange={e => setRatingAverage(Number(e.target.value))}
              aria-label="Avaliação do profissional"
            />
          </div>

          <div className={styles.profFormFooter}>
            <button type="button" onClick={() => setIsOpen(false)} className={styles.profFormBtnSecondary}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting || isUploading}>
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
