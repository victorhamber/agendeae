'use client';

import { useState, useRef } from 'react';
import { updateCompanyInfo, checkSlugAvailability } from '@/app/actions/company';
import type { Company } from '@prisma/client';
import styles from '../../app.module.css';

function ImageUploadField({ 
  label, 
  hint, 
  exampleDimensions,
  currentUrl, 
  onUrlChange,
  aspectLabel
}: { 
  label: string; 
  hint: string; 
  exampleDimensions?: string;
  currentUrl: string; 
  onUrlChange: (url: string) => void;
  aspectLabel: string;
  accept?: string;
}) {
  const [preview, setPreview] = useState(currentUrl);
  const [fileDimensions, setFileDimensions] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview local
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setPreview(url);
      try {
        const img = new Image();
        img.onload = () => setFileDimensions(`${img.width}×${img.height}px`);
        img.src = url;
      } catch {
        setFileDimensions('');
      }
    };
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
    setFileDimensions('');
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div>
      <label className={`${styles.companyLabel} ${styles.companyLabelTight}`}>{label}</label>
      <span className={styles.companyHint}>{hint}</span>
      {(exampleDimensions || fileDimensions) && (
        <span className={styles.companyHint}>
          {exampleDimensions ? <>Ex.: <strong>{exampleDimensions}</strong></> : null}
          {exampleDimensions && fileDimensions ? ' • ' : null}
          {fileDimensions ? <>Arquivo: <strong>{fileDimensions}</strong></> : null}
        </span>
      )}
      <div className={styles.imageUploadRow}>
        <div 
          onClick={() => fileRef.current?.click()}
          className={`${styles.imageUploadBox} ${aspectLabel === 'cover' ? styles.imageUploadBoxCover : styles.imageUploadBoxLogo}`}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Preview" className={styles.imagePreviewImg} />
          ) : (
            <span className={styles.imageEmptyIcon}>📷</span>
          )}
          {isUploading && (
            <div className={styles.uploadOverlay}>
              Enviando...
            </div>
          )}
        </div>
        <div className={styles.imageActions}>
          <button type="button" onClick={() => fileRef.current?.click()}
            className={styles.imageActionBtn}>
            {preview ? 'Trocar' : 'Enviar Imagem'}
          </button>
          {preview && (
            <button type="button" onClick={remove}
              className={`${styles.imageActionBtn} ${styles.imageRemoveBtn}`}>
              Remover
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept={accept || "image/jpeg,image/png,image/webp"} aria-label={`Selecionar imagem: ${label}`} onChange={handleUpload} className={styles.hiddenInput} />
      </div>
    </div>
  );
}

export default function CompanyForm({ company }: { company: Company }) {
  const [name, setName] = useState(company.name || '');
  const [segment, setSegment] = useState(company.segment || '');
  const [description, setDescription] = useState(company.description || '');
  const [slug, setSlug] = useState(company.slug || '');
  const [slugError, setSlugError] = useState('');
  const [slugOk, setSlugOk] = useState(false);
  const [primaryColor, setPrimaryColor] = useState(company.primaryColor || '#4f46e5');
  const [timezone, setTimezone] = useState((company as Company & { timezone?: string }).timezone || 'America/Sao_Paulo');
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
        const result = await checkSlugAvailability(formatted);
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
      await updateCompanyInfo({ 
        name, segment, description, slug, primaryColor, timezone, logoUrl, coverUrl, whatsapp, instagram, address 
      });
      originalSlug.current = slug;
      alert('Personalização atualizada com sucesso!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar dados.';
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid-2-col">
      {/* Coluna 1: Dados Básicos */}
      <div className={styles.companyCol}>
        <div className={`grid-2-col ${styles.companyGridGap}`}>
          <div>
            <label className={styles.companyLabel}>Nome do Negócio</label>
            <input type="text" className="input" value={name} onChange={e => setName(e.target.value)} aria-label="Nome do negócio" required />
          </div>
          <div>
            <label className={styles.companyLabel}>Segmento / Tag (opcional)</label>
            <input type="text" className="input" value={segment} onChange={e => setSegment(e.target.value)} placeholder="Ex: BARBEARIA" />
          </div>
        </div>
        
        {/* Slug com validação em tempo real */}
        <div>
          <label className={styles.companyLabel}>Link da sua Agenda (Slug)</label>
          <div className={styles.companySlugRow}>
            <span className={styles.companySlugPrefix}>agendeae.com.br/</span>
            <input 
              type="text" className="input" value={slug} 
              onChange={e => handleSlugChange(e.target.value)} 
              required 
              aria-label="Slug (link público da agenda)"
              data-invalid={slugError ? 'true' : undefined}
              data-valid={!slugError && slugOk ? 'true' : undefined}
            />
          </div>
          {slugError && <p className={styles.companySlugError}>❌ {slugError}</p>}
          {slugOk && <p className={styles.companySlugOk}>✅ Link disponível!</p>}
        </div>

        <div>
          <label className={styles.companyLabel}>Breve Descrição (Bio)</label>
          <textarea className="input" value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Ex: Barbearia tradicional com cerveja gelada." />
        </div>

        <div>
          <label className={styles.companyLabel}>Endereço (Opcional)</label>
          <input type="text" className="input" value={address} onChange={e => setAddress(e.target.value)} placeholder="Ex: Rua das Flores, 123 - Centro" />
        </div>
      </div>

      {/* Coluna 2: Imagens, Design e Contatos */}
      <div className={styles.companyCol}>
        <div className={`grid-2-col ${styles.companyGridGap}`}>
          <ImageUploadField 
            label="Logo (obrigatório PNG para o App)" 
            hint="Obrigatório ser PNG transparente para instalar o App." 
            exampleDimensions="400×400px (Formato: PNG)"
            currentUrl={logoUrl} 
            onUrlChange={setLogoUrl}
            aspectLabel="logo"
            accept="image/png"
          />
          <ImageUploadField 
            label="Capa (Fundo)" 
            hint="Recomendado: Paisagem 2:1 (1200×600px). Formatos: JPG, PNG ou WebP."
            exampleDimensions="1200×600px"
            currentUrl={coverUrl} 
            onUrlChange={setCoverUrl}
            aspectLabel="cover"
          />
        </div>

        <div className={`grid-2-col ${styles.companyGridGap}`}>
          <div>
            <label className={styles.companyLabel}>WhatsApp (Opcional)</label>
            <input type="tel" className="input" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="(11) 99999-9999" />
          </div>
          <div>
            <label className={styles.companyLabel}>Instagram (Opcional)</label>
            <input type="text" className="input" value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="@suabarbearia" />
          </div>
        </div>

        <div>
          <label className={styles.companyLabel}>Cor Primária (Tema)</label>
          <div className={styles.colorRow}>
            <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} aria-label="Cor primária da marca" className={styles.colorPicker} />
            <span className={styles.companySlugPrefix}>Cor dos botões e do design do seu link.</span>
          </div>
        </div>

        <div>
          <label className={styles.companyLabel}>Fuso Horário</label>
          <span className={styles.companyHint}>Usado para calendário, horários disponíveis e lembretes automáticos.</span>
          <select className="input" value={timezone} onChange={e => setTimezone(e.target.value)} aria-label="Fuso horário da empresa">
            <option value="America/Sao_Paulo">Brasil (UTC-3) — São Paulo / Brasília</option>
            <option value="America/Manaus">Brasil (UTC-4) — Manaus</option>
            <option value="America/Rio_Branco">Brasil (UTC-5) — Rio Branco</option>
            <option value="America/Noronha">Brasil (UTC-2) — Fernando de Noronha</option>
          </select>
        </div>

        <div className={styles.saveRow}>
          <button type="submit" className={`btn-primary ${styles.saveButtonFull}`} disabled={isSubmitting || !!slugError}>
            {isSubmitting ? 'Salvando...' : 'Salvar Personalização'}
          </button>
        </div>
      </div>
    </form>
  );
}
