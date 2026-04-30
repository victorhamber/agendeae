'use client';

import { useState, useRef } from 'react';
import { createProfessional, updateProfessional } from '@/app/actions/professionals';

export default function ProfessionalForm({ companyId, professional }: { companyId: string, professional?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(professional?.name || '');
  const [specialty, setSpecialty] = useState(professional?.specialty || '');
  const [photoUrl, setPhotoUrl] = useState(professional?.photoUrl || '');
  const [photoPreview, setPhotoPreview] = useState(professional?.photoUrl || '');
  const [ratingAverage, setRatingAverage] = useState(professional?.ratingAverage || 5.0);
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
          password: password || undefined 
        });
      } else {
        await createProfessional(companyId, { 
          name, specialty, 
          email: email || undefined, 
          password: password || undefined 
        });
      }
      setIsOpen(false);
      if (!professional) {
        setName('');
        setSpecialty('');
        setPhotoUrl('');
        setPhotoPreview('');
        setRatingAverage(5.0);
        setEmail('');
        setPassword('');
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Erro ao salvar profissional');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    if (professional) {
      return (
        <button onClick={() => setIsOpen(true)} style={{ color: 'var(--primary)', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>
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
      {/* Modal Backdrop */}
      <div onClick={() => setIsOpen(false)} style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 100, backdropFilter: 'blur(2px)'
      }} />
      
      {/* Modal Content */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '95%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto',
        backgroundColor: 'var(--card)', borderRadius: 'var(--radius)',
        border: '1px solid var(--border)', padding: '1.5rem',
        zIndex: 101, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>{professional ? 'Editar Profissional' : 'Novo Profissional'}</h3>
          <button onClick={() => setIsOpen(false)} style={{ fontSize: '1.25rem', color: 'var(--muted)', cursor: 'pointer' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Foto do Profissional */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div 
              onClick={() => fileRef.current?.click()}
              style={{ 
                width: '72px', height: '72px', borderRadius: '50%', 
                border: '2px dashed var(--border)', cursor: 'pointer',
                overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.03)', flexShrink: 0, position: 'relative'
              }}
            >
              {photoPreview ? (
                <img src={photoPreview} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '1.5rem', color: 'var(--muted)' }}>👤</span>
              )}
              {isUploading && (
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '0.6rem', fontWeight: 600
                }}>
                  ...
                </div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <button type="button" onClick={() => fileRef.current?.click()}
                style={{ padding: '0.4rem 0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 500 }}>
                {photoPreview ? 'Trocar Foto' : 'Enviar Foto'}
              </button>
              {photoPreview && (
                <button type="button" onClick={removePhoto}
                  style={{ padding: '0.4rem 0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--danger)', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 500 }}>
                  Remover
                </button>
              )}
              <span style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>Quadrado 400×400px. JPG, PNG ou WebP.</span>
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} style={{ display: 'none' }} />
          </div>

          {/* Nome e Especialidade */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem', fontWeight: 500 }}>Nome</label>
              <input type="text" className="input" required value={name} onChange={e => setName(e.target.value)} placeholder="Ex: João Barbeiro" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem', fontWeight: 500 }}>Especialidade</label>
              <input type="text" className="input" required value={specialty} onChange={e => setSpecialty(e.target.value)} placeholder="Ex: Degrade" />
            </div>
          </div>
          
          {/* Login do Profissional */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '0.75rem' }}>Dados de Acesso (Login)</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem', fontWeight: 500 }}>E-mail</label>
                <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} placeholder="profissional@empresa.com" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem', fontWeight: 500 }}>{professional ? 'Nova Senha' : 'Senha'}</label>
                <input type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} placeholder="******" />
              </div>
            </div>
          </div>

          {/* Avaliação */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem', fontWeight: 500 }}>Avaliação (Estrelas)</label>
            <input type="number" step="0.1" min="0" max="5" className="input" required value={ratingAverage} onChange={e => setRatingAverage(Number(e.target.value))} style={{ maxWidth: '120px' }} />
          </div>

          {/* Botões */}
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
            <button type="button" onClick={() => setIsOpen(false)} style={{ padding: '0.75rem 1.25rem', borderRadius: 'var(--radius)', backgroundColor: 'transparent', border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 500 }}>
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
