'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister({ slug }: { slug: string }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    // Registra cedo para habilitar o beforeinstallprompt (PWA install) no Chrome.
    navigator.serviceWorker.register(`/${slug}/sw.js`).catch(() => null);
  }, [slug]);

  return null;
}

