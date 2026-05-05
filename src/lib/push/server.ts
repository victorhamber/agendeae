import webpush from 'web-push';

export type WebPushSubscription = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

let configured = false;

function ensureConfigured() {
  if (configured) return;
  const subject = process.env.VAPID_SUBJECT;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!subject || !publicKey || !privateKey) {
    throw new Error('Web Push não configurado: defina VAPID_SUBJECT, VAPID_PUBLIC_KEY e VAPID_PRIVATE_KEY');
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
}

export async function sendWebPush(
  sub: WebPushSubscription,
  payload: Record<string, unknown>
): Promise<void> {
  ensureConfigured();
  await webpush.sendNotification(sub as unknown as webpush.PushSubscription, JSON.stringify(payload));
}

export function normalizePhone(value: string) {
  return (value ?? '').replace(/\D/g, '');
}

