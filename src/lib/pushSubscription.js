// Frontend helper for Web Push subscriptions.
// All API calls assume same-origin and use credentials: 'include'.

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) out[i] = raw.charCodeAt(i);
  return out;
}

export function isPushSupported() {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export function isStandalonePWA() {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia?.('(display-mode: standalone)').matches) return true;
  // iOS legacy
  if (window.navigator && window.navigator.standalone) return true;
  return false;
}

export function isIOS() {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

export function getNotificationPermission() {
  if (typeof Notification === 'undefined') return 'unsupported';
  return Notification.permission; // 'default' | 'granted' | 'denied'
}

async function getRegistration() {
  if (!('serviceWorker' in navigator)) return null;
  const reg = await navigator.serviceWorker.ready;
  return reg;
}

export async function getCurrentSubscription() {
  const reg = await getRegistration();
  if (!reg) return null;
  return reg.pushManager.getSubscription();
}

export async function isPushEnabled() {
  if (!isPushSupported()) return false;
  if (Notification.permission !== 'granted') return false;
  const sub = await getCurrentSubscription();
  return !!sub;
}

async function fetchPublicKey() {
  const res = await fetch('/api/push/public-key', { credentials: 'include' });
  if (!res.ok) throw new Error('VAPID-Key nicht verfügbar');
  const data = await res.json();
  if (!data.publicKey) throw new Error('Kein VAPID Public Key');
  return data.publicKey;
}

async function postSubscription(subscription) {
  const res = await fetch('/api/push/subscribe', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription.toJSON ? subscription.toJSON() : subscription),
  });
  if (!res.ok) throw new Error('Subscription nicht akzeptiert');
}

async function postUnsubscribe(endpoint) {
  await fetch('/api/push/unsubscribe', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint }),
  }).catch(() => {});
}

export async function enablePush() {
  if (!isPushSupported()) {
    throw new Error('Push wird auf diesem Gerät/Browser nicht unterstützt.');
  }
  if (isIOS() && !isStandalonePWA()) {
    throw new Error('Auf iOS bitte zuerst die App zum Home-Bildschirm hinzufügen.');
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Berechtigung für Benachrichtigungen verweigert.');
  }

  const reg = await getRegistration();
  if (!reg) throw new Error('Service Worker nicht aktiv.');

  const existing = await reg.pushManager.getSubscription();
  if (existing) {
    await postSubscription(existing);
    return existing;
  }

  const publicKey = await fetchPublicKey();
  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });
  await postSubscription(subscription);
  return subscription;
}

export async function disablePush() {
  const sub = await getCurrentSubscription();
  if (!sub) return;
  const endpoint = sub.endpoint;
  try { await sub.unsubscribe(); } catch (_) {}
  await postUnsubscribe(endpoint);
}

// Refresh the server-side record of the current subscription, e.g. after login.
// Silent — never throws, never prompts for permission.
export async function syncExistingSubscription() {
  try {
    if (!isPushSupported()) return;
    if (Notification.permission !== 'granted') return;
    const sub = await getCurrentSubscription();
    if (!sub) return;
    await postSubscription(sub);
  } catch (_) {
    // ignore
  }
}
