'use client';

import { useActionState, useEffect, useState } from 'react';
import { changePassword } from '@/app/actions/auth';

export default function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePassword, null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (state?.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  }, [state?.success]);

  return (
    <form action={action} style={{ display: 'grid', gap: '0.75rem', maxWidth: 420 }}>
      {state?.error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
          {state.error}
        </div>
      )}
      {state?.success && (
        <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
          Senha atualizada com sucesso.
        </div>
      )}

      <div>
        <label htmlFor="currentPassword" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
          Senha atual
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          className="input"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          disabled={pending}
          required
        />
      </div>

      <div>
        <label htmlFor="newPassword" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
          Nova senha
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          className="input"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          disabled={pending}
          required
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
          Confirmar nova senha
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          className="input"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={pending}
          required
        />
      </div>

      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? 'Salvando...' : 'Redefinir senha'}
      </button>
    </form>
  );
}

