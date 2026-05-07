'use client';

import { useState } from 'react';
import { updateCustomerNotes } from '@/app/actions/customer';

export default function CustomerNotesModal({ 
  customerId, 
  customerName, 
  initialNotes 
}: { 
  customerId: string; 
  customerName: string; 
  initialNotes: string; 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState(initialNotes || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateCustomerNotes(customerId, notes);
      setIsOpen(false);
    } catch (e) {
      alert('Erro ao salvar anotações');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          padding: '0.4rem 0.75rem',
          backgroundColor: 'transparent',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          fontSize: '0.75rem',
          fontWeight: 500,
          cursor: 'pointer',
          color: 'var(--primary)',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}
      >
        📝 Ficha / Notas
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <div className="glass" style={{
            width: '100%', maxWidth: '500px', padding: '2rem',
            borderRadius: '1rem', position: 'relative', margin: '1rem'
          }}>
            <button 
              onClick={() => setIsOpen(false)}
              style={{
                position: 'absolute', top: '1rem', right: '1rem',
                background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer',
                color: 'var(--muted)'
              }}
            >
              ✕
            </button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Ficha do Cliente
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              {customerName}
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                Anotações (Anamnese, preferências, histórico)
              </label>
              <textarea
                className="input"
                style={{ width: '100%', minHeight: '150px', resize: 'vertical' }}
                placeholder="Ex: Alérgico a produto X. Prefere o cabelo curto nas laterais..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                onClick={() => setIsOpen(false)}
                style={{ padding: '0.5rem 1rem', border: 'none', background: 'none', color: 'var(--muted)', cursor: 'pointer', fontWeight: 500 }}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                onClick={handleSave}
                disabled={isSaving}
                className="btn-primary"
              >
                {isSaving ? 'Salvando...' : 'Salvar Ficha'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
