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

function isStandalone() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export default function InstallAppButton({ companyName }: { companyName?: string }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [alreadyInstalled, setAlreadyInstalled] = useState(false);
  const ios = useMemo(() => isIos(), []);

  useEffect(() => {
    setAlreadyInstalled(isStandalone());
  }, []);

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

  if (alreadyInstalled) return null;

  const label = companyName?.trim() || 'esta agenda';

  return (
    <div className={styles.installWrap}>
      {deferred ? (
        <button type="button" className={styles.installBtn} onClick={onInstall}>
          ⬇️ Baixar App da Empresa
        </button>
      ) : null}
    </div>
  );
}

