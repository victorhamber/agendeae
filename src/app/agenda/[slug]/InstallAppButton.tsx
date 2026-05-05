'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './agenda.module.css';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

function isIos() {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export default function InstallAppButton() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const ios = useMemo(() => isIos(), []);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const onInstall = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice.catch(() => null);
    setDeferred(null);
  };

  if (!deferred && !ios) return null;

  return (
    <div className={styles.installWrap}>
      {deferred ? (
        <button type="button" className={styles.installBtn} onClick={onInstall}>
          Baixar app
        </button>
      ) : null}
      {!deferred && ios ? (
        <p className={styles.installHint}>
          Para instalar: toque em <strong>Compartilhar</strong> e depois em <strong>Adicionar à Tela de Início</strong>.
        </p>
      ) : null}
    </div>
  );
}

