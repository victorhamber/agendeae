'use client';

import { useState } from 'react';
import { updateLicenseStatus, updateLicenseExpiry } from '@/app/actions/licenses';

export default function LicenseActions({ license }: {
  license: { id: string; status: string; expiresAt: string | null };
}) {
  const [showActions, setShowActions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (!confirm(`Alterar status para ${newStatus}?`)) return;
    setIsLoading(true);
    try {
      await updateLicenseStatus(license.id, newStatus);
      setShowActions(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExpiryChange = async () => {
    const newDate = prompt('Nova data de vencimento (YYYY-MM-DD):', license.expiresAt?.split('T')[0] || '');
    if (!newDate) return;
    setIsLoading(true);
    try {
      await updateLicenseExpiry(license.id, newDate);
      setShowActions(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro');
    } finally {
      setIsLoading(false);
    }
  };

  if (!showActions) {
    return (
      <button
        onClick={() => setShowActions(true)}
        style={{ color: 'var(--primary)', fontWeight: 500, fontSize: '0.875rem' }}
      >
        Gerenciar
      </button>
    );
  }

  const statusOptions = [
    { value: 'ACTIVE', label: 'Ativar', color: 'var(--success)' },
    { value: 'TRIAL', label: 'Trial', color: 'var(--primary)' },
    { value: 'BLOCKED', label: 'Bloquear', color: 'var(--danger)' },
    { value: 'CANCELLED', label: 'Cancelar', color: 'var(--danger)' },
    { value: 'EXPIRED', label: 'Expirar', color: '#F59E0B' },
  ].filter(s => s.value !== license.status);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
      <button
        onClick={() => setShowActions(false)}
        style={{ color: 'var(--muted)', fontSize: '0.75rem', marginBottom: '0.25rem' }}
      >
        ✕ Fechar
      </button>
      {statusOptions.map(opt => (
        <button
          key={opt.value}
          onClick={() => handleStatusChange(opt.value)}
          disabled={isLoading}
          style={{
            color: opt.color,
            fontWeight: 500,
            fontSize: '0.8rem',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            border: `1px solid ${opt.color}`,
            backgroundColor: 'transparent',
          }}
        >
          {opt.label}
        </button>
      ))}
      <button
        onClick={handleExpiryChange}
        disabled={isLoading}
        style={{
          color: 'var(--primary)',
          fontWeight: 500,
          fontSize: '0.8rem',
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          border: '1px solid var(--primary)',
          backgroundColor: 'transparent',
        }}
      >
        Alterar Vencimento
      </button>
    </div>
  );
}
