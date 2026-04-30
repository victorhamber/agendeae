'use client';

import { useState, useRef } from 'react';
import { createService, updateService } from '@/app/actions/services';

export default function ServiceForm({ companyId, service }: { companyId: string, service?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(service?.name || '');
  const [description, setDescription] = useState(service?.description || '');
  const [price, setPrice] = useState(service?.price?.toString() || '');
  const [durationMinutes, setDurationMinutes] = useState(service?.durationMinutes?.toString() || '');
  const [imageUrl, setImageUrl] = useState(service?.imageUrl || '');
  const [imagePreview, setImagePreview] = useState(service?.imageUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview local imediato
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload para o servidor
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        setImageUrl(data.url);
      } else {
        alert(data.error || 'Erro no upload');
        setImagePreview(service?.imageUrl || '');
      }
    } catch {
      alert('Erro ao enviar imagem');
      setImagePreview(service?.imageUrl || '');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setImageUrl('');
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name,
        price: parseFloat(price),
        durationMinutes: parseInt(durationMinutes, 10),
        description: description || undefined,
        imageUrl: imageUrl || undefined,
      };

      if (service) {
        await updateService(service.id, payload);
      } else {
        await createService(companyId, payload);
      }
      setIsOpen(false);
      if (!service) {
        setName('');
        setDescription('');
        setPrice('');
        setDurationMinutes('');
        setImageUrl('');
        setImagePreview('');
      }
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar serviço');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    if (service) {
      return (
        <button onClick={() => setIsOpen(true)} style={{ color: 'var(--primary)', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>
          Editar
        </button>
      );
    }
    return (
      <button className="btn-primary" onClick={() => setIsOpen(true)}>
        + Novo Serviço
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
        width: '95%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto',
        backgroundColor: 'var(--card)', borderRadius: 'var(--radius)',
        border: '1px solid var(--border)', padding: '1.5rem',
        zIndex: 101, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>{service ? 'Editar Serviço' : 'Novo Serviço'}</h3>
          <button onClick={() => setIsOpen(false)} style={{ fontSize: '1.25rem', color: 'var(--muted)', cursor: 'pointer' }}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Imagem do Serviço */}
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Imagem do Serviço</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Thumbnail / Preview */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              style={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: 'var(--radius)', 
                border: '2px dashed var(--border)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                cursor: 'pointer',
                overflow: 'hidden',
                backgroundColor: 'rgba(0,0,0,0.03)',
                flexShrink: 0,
                position: 'relative',
              }}
            >
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                <span style={{ fontSize: '2rem', color: 'var(--muted)', lineHeight: 1 }}>📷</span>
              )}
              {isUploading && (
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '0.7rem', fontWeight: 600
                }}>
                  Enviando...
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                style={{ 
                  padding: '0.5rem 1rem', borderRadius: 'var(--radius)', 
                  border: '1px solid var(--border)', backgroundColor: 'transparent', 
                  cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 
                }}
              >
                {imagePreview ? 'Trocar Imagem' : 'Escolher Imagem'}
              </button>
              {imagePreview && (
                <button 
                  type="button" 
                  onClick={removeImage}
                  style={{ 
                    padding: '0.5rem 1rem', borderRadius: 'var(--radius)', 
                    border: '1px solid var(--danger, #EF4444)', backgroundColor: 'transparent', 
                    cursor: 'pointer', fontSize: '0.8rem', color: 'var(--danger, #EF4444)', fontWeight: 500 
                  }}
                >
                  Remover
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.5rem' }}>JPEG, PNG, WebP ou GIF. Máximo 5MB.</p>
        </div>

        {/* Nome e Descrição */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Nome do Serviço</label>
            <input type="text" className="input" required value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Corte Degradê" />
          </div>
          <div style={{ flex: '1 1 100px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Preço (R$)</label>
            <input type="number" step="0.01" className="input" required value={price} onChange={e => setPrice(e.target.value)} placeholder="Ex: 45.00" />
          </div>
          <div style={{ flex: '1 1 100px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Duração (min)</label>
            <input type="number" className="input" required value={durationMinutes} onChange={e => setDurationMinutes(e.target.value)} placeholder="Ex: 45" />
          </div>
        </div>

        {/* Descrição */}
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Descrição (opcional)</label>
          <textarea 
            className="input" 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            placeholder="Descreva o serviço para seus clientes..."
            rows={3}
            style={{ resize: 'vertical', minHeight: '70px' }}
          />
        </div>

        {/* Botões */}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button type="button" onClick={() => setIsOpen(false)} style={{ padding: '0.75rem 1.25rem', borderRadius: 'var(--radius)', backgroundColor: 'transparent', border: '1px solid var(--border)', cursor: 'pointer' }}>
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
