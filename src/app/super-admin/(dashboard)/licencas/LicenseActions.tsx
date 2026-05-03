'use client';

import { useState } from 'react';
import { updateLicenseStatus, updateLicenseExpiry, deleteLicense } from '@/app/actions/licenses';

type ActionType = 'status' | 'expiry' | 'delete' | null;

export default function LicenseActions({ license }: {
  license: { id: string; status: string; expiresAt: string | null };
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: ActionType; value?: string } | null>(null);
  const [newDate, setNewDate] = useState(license.expiresAt?.split('T')[0] || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async () => {
    if (!pendingAction) return;
    setIsLoading(true);
    setError(null);
    try {
      if (pendingAction.type === 'status' && pendingAction.value) {
        await updateLicenseStatus(license.id, pendingAction.value);
      } else if (pendingAction.type === 'expiry') {
        await updateLicenseExpiry(license.id, newDate);
      } else if (pendingAction.type === 'delete') {
        await deleteLicense(license.id);
      }
      setPendingAction(null);
      setShowMenu(false);
    } catch (err: any) {
      setError(err.message || 'Erro ao executar ação');
    } finally {
      setIsLoading(false);
    }
  };

  const statusOptions = [
    { value: 'ACTIVE', label: 'Ativar', color: 'var(--success)' },
    { value: 'TRIAL', label: 'Trial', color: 'var(--primary)' },
    { value: 'BLOCKED', label: 'Bloquear', color: 'var(--danger)' },
    { value: 'CANCELLED', label: 'Cancelar', color: 'var(--danger)' },
    { value: 'EXPIRED', label: 'Expirar', color: '#F59E0B' },
  ].filter(s => s.value !== license.status);

  return (
    <>
      {/* Modal de confirmação */}
      {pendingAction && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100
        }}>
          <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius)', width: '100%', maxWidth: '380px' }}>
            {pendingAction.type === 'delete' ? (
              <>
                <h3 style={{ fontWeight: 'bold', marginBottom: '0.75rem', color: 'var(--danger)' }}>⚠️ Excluir Licença</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                  Isso vai excluir <strong>permanentemente</strong> a licença, a empresa e o usuário dono. Esta ação não pode ser desfeita.
                </p>
              </>
            ) : pendingAction.type === 'expiry' ? (
              <>
                <h3 style={{ fontWeight: 'bold', marginBottom: '0.75rem' }}>Alterar Vencimento</h3>
                <input
                  type="date"
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  className="input"
                  style={{ marginBottom: '1.5rem' }}
                />
              </>
            ) : (
              <>
                <h3 style={{ fontWeight: 'bold', marginBottom: '0.75rem' }}>Confirmar Ação</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                  Alterar status para <strong>{pendingAction.value}</strong>?
                </p>
              </>
            )}

            {error && (
              <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setPendingAction(null); setError(null); }}
                disabled={isLoading}
                className="btn-primary"
                style={{ backgroundColor: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)' }}
              >
                Cancelar
              </button>
              <button
                onClick={execute}
                disabled={isLoading}
                className="btn-primary"
                style={pendingAction.type === 'delete' ? { backgroundColor: 'var(--danger)' } : {}}
              >
                {isLoading ? 'Aguarde...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Menu de ações inline */}
      {!showMenu ? (
        <button onClick={() => setShowMenu(true)} style={{ color: 'var(--primary)', fontWeight: 500, fontSize: '0.875rem' }}>
          Gerenciar
        </button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
          <button onClick={() => setShowMenu(false)} style={{ color: 'var(--muted)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
            ✕ Fechar
          </button>
          {statusOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setPendingAction({ type: 'status', value: opt.value })}
              style={{
                color: opt.color, fontWeight: 500, fontSize: '0.8rem',
                padding: '0.25rem 0.5rem', borderRadius: '4px',
                border: `1px solid ${opt.color}`, backgroundColor: 'transparent',
              }}
            >
              {opt.label}
            </button>
          ))}
          <button
            onClick={() => { setNewDate(license.expiresAt?.split('T')[0] || ''); setPendingAction({ type: 'expiry' }); }}
            style={{
              color: 'var(--primary)', fontWeight: 500, fontSize: '0.8rem',
              padding: '0.25rem 0.5rem', borderRadius: '4px',
              border: '1px solid var(--primary)', backgroundColor: 'transparent',
            }}
          >
            Alterar Vencimento
          </button>
          <button
            onClick={() => setPendingAction({ type: 'delete' })}
            style={{
              color: 'var(--danger)', fontWeight: 500, fontSize: '0.8rem',
              padding: '0.25rem 0.5rem', borderRadius: '4px',
              border: '1px solid var(--danger)', backgroundColor: 'transparent',
              marginTop: '0.5rem',
            }}
          >
            🗑 Excluir
          </button>
        </div>
      )}
    </>
  );
}
