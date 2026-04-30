'use client';

import { useState, useRef } from 'react';
import { updateCompanyInfo, checkSlugAvailability } from '@/app/actions/company';

function ImageUploadField({ 
  label, 
  hint, 
  currentUrl, 
  onUrlChange,
  aspectLabel
}: { 
  label: string; 
  hint: string; 
  currentUrl: string; 
  onUrlChange: (url: string) => void;
  aspectLabel: string;
}) {
  const [preview, setPreview] = useState(currentUrl);
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview local
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        onUrlChange(data.url);
        setPreview(data.url);
      } else {
        alert(data.error || 'Erro no upload');
        setPreview(currentUrl);
      }
    } catch {
      alert('Erro ao enviar imagem.');
      setPreview(currentUrl);
    } finally {
      setIsUploading(false);
    }
  };

  const remove = () => {
    onUrlChange('');
    setPreview('');
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div>
      <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.25rem' }}>{label}</label>
      <span style={{ display: 'block', color: 'var(--muted)', fontSize: '0.7rem', marginBottom: '0.5rem' }}>
        {hint}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div 
          onClick={() => fileRef.current?.click()}
          style={{ 
            width: aspectLabel === 'cover' ? '120px' : '80px', 
            height: '80px', 
            borderRadius: 'var(--radius)', 
            border: '2px dashed var(--border)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', overflow: 'hidden',
            backgroundColor: 'rgba(0,0,0,0.03)', flexShrink: 0,
            position: 'relative',
          }}
        >
          {preview ? (
            <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '1.5rem', color: 'var(--muted)' }}>📷</span>
          )}
          {isUploading && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '0.65rem', fontWeight: 600
            }}>
              Enviando...
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <button type="button" onClick={() => fileRef.current?.click()}
            style={{ 
              padding: '0.4rem 0.75rem', borderRadius: 'var(--radius)', 
              border: '1px solid var(--border)', backgroundColor: 'transparent', 
              cursor: 'pointer', fontSize: '0.75rem', fontWeight: 500 
            }}>
            {preview ? 'Trocar' : 'Enviar Imagem'}
          </button>
          {preview && (
            <button type="button" onClick={remove}
              style={{ 
                padding: '0.4rem 0.75rem', borderRadius: 'var(--radius)', 
                border: '1px solid var(--danger, #EF4444)', backgroundColor: 'transparent', 
                cursor: 'pointer', fontSize: '0.75rem', color: 'var(--danger, #EF4444)', fontWeight: 500 
              }}>
              Remover
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUpload} style={{ display: 'none' }} />
      </div>
    </div>
  );
}

export default function CompanyForm({ company }: { company: any }) {
  const [name, setName] = useState(company.name || '');
  const [segment, setSegment] = useState(company.segment || '');
  const [description, setDescription] = useState(company.description || '');
  const [slug, setSlug] = useState(company.slug || '');
  const [slugError, setSlugError] = useState('');
  const [slugOk, setSlugOk] = useState(false);
  const [primaryColor, setPrimaryColor] = useState(company.primaryColor || '#4f46e5');
  const [logoUrl, setLogoUrl] = useState(company.logoUrl || '');
  const [coverUrl, setCoverUrl] = useState(company.coverUrl || '');
  const [whatsapp, setWhatsapp] = useState(company.whatsapp || '');
  const [instagram, setInstagram] = useState(company.instagram || '');
  const [address, setAddress] = useState(company.address || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const slugTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const originalSlug = useRef(company.slug || '');

  const handleSlugChange = (value: string) => {
    // Limpar e formatar slug (apenas letras minúsculas, números, hífens)
    const formatted = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSlug(formatted);
    setSlugError('');
    setSlugOk(false);

    if (formatted === originalSlug.current) {
      setSlugOk(true);
      return;
    }

    if (formatted.length < 3) {
      setSlugError('Mínimo de 3 caracteres.');
      return;
    }

    // Debounce na verificação
    if (slugTimeout.current) clearTimeout(slugTimeout.current);
    slugTimeout.current = setTimeout(async () => {
      try {
        const result = await checkSlugAvailability(formatted, company.id);
        if (result.available) {
          setSlugOk(true);
          setSlugError('');
        } else {
          setSlugError('Este link já está em uso por outra empresa.');
          setSlugOk(false);
        }
      } catch {
        setSlugError('Erro ao verificar disponibilidade.');
      }
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (slugError) return;

    setIsSubmitting(true);
    try {
      await updateCompanyInfo(company.id, { 
        name, segment, description, slug, primaryColor, logoUrl, coverUrl, whatsapp, instagram, address 
      });
      originalSlug.current = slug;
      alert('Personalização atualizada com sucesso!');
    } catch (error: any) {
      alert(error?.message || 'Erro ao atualizar dados.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid-2-col">
      {/* Coluna 1: Dados Básicos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="grid-2-col" style={{ gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>Nome do Negócio</label>
            <input type="text" className="input" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>Segmento / Tag (opcional)</label>
            <input type="text" className="input" value={segment} onChange={e => setSegment(e.target.value)} placeholder="Ex: BARBEARIA" />
          </div>
        </div>
        
        {/* Slug com validação em tempo real */}
        <div>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>Link da sua Agenda (Slug)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--muted)', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>agendeae.com.br/</span>
            <input 
              type="text" className="input" value={slug} 
              onChange={e => handleSlugChange(e.target.value)} 
              required 
              style={{ 
                borderColor: slugError ? 'var(--danger, #EF4444)' : slugOk ? 'var(--success, #22C55E)' : undefined 
              }}
            />
          </div>
          {slugError && <p style={{ color: 'var(--danger, #EF4444)', fontSize: '0.75rem', marginTop: '0.25rem' }}>❌ {slugError}</p>}
          {slugOk && <p style={{ color: 'var(--success, #22C55E)', fontSize: '0.75rem', marginTop: '0.25rem' }}>✅ Link disponível!</p>}
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>Breve Descrição (Bio)</label>
          <textarea className="input" value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Ex: Barbearia tradicional com cerveja gelada." />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>Endereço (Opcional)</label>
          <input type="text" className="input" value={address} onChange={e => setAddress(e.target.value)} placeholder="Ex: Rua das Flores, 123 - Centro" />
        </div>
      </div>

      {/* Coluna 2: Imagens, Design e Contatos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="grid-2-col" style={{ gap: '1rem' }}>
          <ImageUploadField 
            label="Logo" 
            hint="Recomendado: Quadrado 400×400px. Formatos: JPG, PNG ou WebP." 
            currentUrl={logoUrl} 
            onUrlChange={setLogoUrl}
            aspectLabel="logo"
          />
          <ImageUploadField 
            label="Capa (Fundo)" 
            hint="Recomendado: Paisagem 16:9 (1200×675px). Formatos: JPG, PNG ou WebP."
            currentUrl={coverUrl} 
            onUrlChange={setCoverUrl}
            aspectLabel="cover"
          />
        </div>

        <div className="grid-2-col" style={{ gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>WhatsApp (Opcional)</label>
            <input type="tel" className="input" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="(11) 99999-9999" />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>Instagram (Opcional)</label>
            <input type="text" className="input" value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="@suabarbearia" />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>Cor Primária (Tema)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} style={{ width: '50px', height: '50px', padding: 0, border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer' }} />
            <span style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Cor dos botões e do design do seu link.</span>
          </div>
        </div>

        <div style={{ textAlign: 'right', marginTop: 'auto' }}>
          <button type="submit" className="btn-primary" disabled={isSubmitting || !!slugError} style={{ width: '100%' }}>
            {isSubmitting ? 'Salvando...' : 'Salvar Personalização'}
          </button>
        </div>
      </div>
    </form>
  );
}
