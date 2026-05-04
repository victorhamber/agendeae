'use client';

import { useActionState, useEffect, useState } from 'react';
import { changePassword } from '@/app/actions/auth';
import styles from '../../app.module.css';

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
    <form action={action} className={styles.changePasswordForm}>
      {state?.error && (
        <div className={`${styles.formAlert} ${styles.formAlertError}`}>
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className={`${styles.formAlert} ${styles.formAlertSuccess}`}>
          Senha atualizada com sucesso.
        </div>
      )}

      <div>
        <label htmlFor="currentPassword" className={styles.formLabel}>
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
        <label htmlFor="newPassword" className={styles.formLabel}>
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
        <label htmlFor="confirmPassword" className={styles.formLabel}>
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

