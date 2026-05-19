import webpush from 'web-push';
import { readJSONAsync, writeJSONAtomic, withDataLock } from './utils.js';

const SUBS_FILE = 'push-subscriptions.json';

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@platform.poltis.ch';

let pushReady = false;
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  try {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
    pushReady = true;
    console.log('[push] VAPID configured — Web Push enabled');
  } catch (err) {
    console.error('[push] Failed to configure VAPID:', err.message);
  }
} else {
  console.warn('[push] VAPID keys missing — push notifications disabled');
}

export function isPushReady() {
  return pushReady;
}

export function getPublicKey() {
  return VAPID_PUBLIC_KEY;
}

async function readStore() {
  const data = await readJSONAsync(SUBS_FILE);
  if (data && typeof data === 'object' && !Array.isArray(data) && data.subscriptions) {
    return data;
  }
  return { subscriptions: {} };
}

async function writeStore(store) {
  await writeJSONAtomic(SUBS_FILE, store);
}

export async function listSubscriptionsForUser(userId) {
  const store = await readStore();
  return store.subscriptions[userId] || [];
}

export async function addSubscription(userId, subscription, userAgent = '') {
  if (!userId || !subscription?.endpoint) return false;
  await withDataLock(async () => {
    const store = await readStore();
    const list = store.subscriptions[userId] || [];
    const existing = list.findIndex(s => s.endpoint === subscription.endpoint);
    const entry = {
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      userAgent: userAgent.slice(0, 200),
      createdAt: new Date().toISOString(),
    };
    if (existing >= 0) list[existing] = entry;
    else list.push(entry);
    store.subscriptions[userId] = list;
    await writeStore(store);
  });
  return true;
}

export async function removeSubscription(userId, endpoint) {
  if (!userId || !endpoint) return false;
  let removed = false;
  await withDataLock(async () => {
    const store = await readStore();
    const list = store.subscriptions[userId] || [];
    const next = list.filter(s => s.endpoint !== endpoint);
    if (next.length === list.length) return;
    if (next.length === 0) delete store.subscriptions[userId];
    else store.subscriptions[userId] = next;
    await writeStore(store);
    removed = true;
  });
  return removed;
}

async function pruneDeadEndpoints(deadEndpoints) {
  if (!deadEndpoints.length) return;
  const store = await readStore();
  let changed = false;
  for (const userId of Object.keys(store.subscriptions)) {
    const before = store.subscriptions[userId].length;
    store.subscriptions[userId] = store.subscriptions[userId].filter(
      s => !deadEndpoints.includes(s.endpoint)
    );
    if (store.subscriptions[userId].length !== before) changed = true;
    if (store.subscriptions[userId].length === 0) delete store.subscriptions[userId];
  }
  if (changed) await writeStore(store);
}

async function sendOne(sub, payloadString) {
  try {
    await webpush.sendNotification(sub, payloadString, { TTL: 60 * 60 });
    return { ok: true };
  } catch (err) {
    const status = err?.statusCode;
    const dead = status === 404 || status === 410;
    if (!dead) {
      console.error(`[push] send failed (status ${status}):`, err.message);
    }
    return { ok: false, dead, endpoint: sub.endpoint };
  }
}

function buildPayload({ title, body, url = '/', tag, badgeCount }) {
  return JSON.stringify({
    title: String(title || 'SCNAT Portal').slice(0, 120),
    body: String(body || '').slice(0, 400),
    url,
    tag,
    ...(typeof badgeCount === 'number' ? { badgeCount } : {}),
  });
}

export async function sendToUsers(userIds, payload) {
  if (!pushReady || !userIds?.length) return;
  const store = await readStore();
  const payloadString = buildPayload(payload);
  const dead = [];
  const tasks = [];
  for (const userId of userIds) {
    const subs = store.subscriptions[userId] || [];
    for (const sub of subs) {
      tasks.push(sendOne(sub, payloadString).then(r => {
        if (r.dead) dead.push(r.endpoint);
      }));
    }
  }
  await Promise.allSettled(tasks);
  await pruneDeadEndpoints(dead);
}

export async function sendToUser(userId, payload) {
  return sendToUsers([userId], payload);
}

export async function sendToAdmins(payload) {
  if (!pushReady) return;
  const users = await readJSONAsync('users.json');
  const adminIds = (Array.isArray(users) ? users : [])
    .filter(u => u.role === 'admin')
    .map(u => u.id);
  return sendToUsers(adminIds, payload);
}

export async function sendToAll(payload) {
  if (!pushReady) return;
  const store = await readStore();
  return sendToUsers(Object.keys(store.subscriptions), payload);
}

// Fire-and-forget wrapper: never let push errors break the calling route.
export function fireAndForget(promise) {
  Promise.resolve(promise).catch(err => {
    console.error('[push] fire-and-forget error:', err?.message || err);
  });
}
