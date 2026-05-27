import webpush from 'web-push';

export function configure(): boolean {
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const sub = process.env.VAPID_SUBJECT;
  if (!pub || !priv || !sub) return false;
  webpush.setVapidDetails(sub, pub, priv);
  return true;
}

export async function sendPush(
  endpoint: string,
  p256dh: string | undefined,
  auth: string | undefined,
  payload: object
): Promise<void> {
  if (!p256dh || !auth) return;
  await webpush.sendNotification({ endpoint, keys: { p256dh, auth } }, JSON.stringify(payload));
}
