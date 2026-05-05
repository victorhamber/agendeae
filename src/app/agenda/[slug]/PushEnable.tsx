'use client';

import { useMemo, useState } from 'react';
import styles from './agenda.module.css';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export default function PushEnable({
  companyId,
  phone,
  slug,
}: {
  companyId: string;
  phone: string;
  slug: string;
}) {
  const [status, setStatus] = useState<'idle' | 'working' | 'ok' | 'error' | 'denied'>('idle');
  const canUse = useMemo(() => typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window, []);

  const enable = async () => {
    if (!canUse) return;
    setStatus('working');
    try {
      const keyRes = await fetch('/api/push/public-key');
      const keyJson = (await keyRes.json()) as { publicKey?: string; error?: string };
      if (!keyRes.ok || !keyJson.publicKey) {
        throw new Error(keyJson.error || 'Servidor sem configuração de notificações (VAPID).');
      }

      const perm = await Notification.requestPermission();
      if (perm !== 'granted') {
        setStatus('denied');
        return;
      }

      const reg = await navigator.serviceWorker.register(`/${slug}/sw.js`);

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(keyJson.publicKey),
      });

      const ua = navigator.userAgent;
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          companyId,
          phone,
          userAgent: ua,
          subscription: sub.toJSON(),
        }),
      });
      if (!res.ok) throw new Error('Falha ao salvar inscrição');
      setStatus('ok');
    } catch (e) {
      console.error(e);
      setStatus('error');
    }
  };

  if (!canUse) return null;

  return (
    <div className={styles.pushEnableWrap}>
      <button type="button" className={styles.pushEnableBtn} onClick={enable} disabled={status === 'working' || status === 'ok'}>
        {status === 'ok' ? 'Lembretes ativados' : status === 'working' ? 'Ativando...' : 'Ativar lembrete por notificação'}
      </button>
      {status === 'denied' && <p className={styles.pushEnableHint}>Permissão negada no navegador. Você pode ativar nas configurações do site.</p>}
      {status === 'error' && (
        <p className={styles.pushEnableHint}>
          Não foi possível ativar os lembretes agora. Seus dados de agendamento continuam válidos; tente de novo mais
          tarde ou use o WhatsApp para lembrar.
        </p>
      )}
    </div>
  );
}

