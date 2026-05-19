import { Router } from 'express';
import { readJSONAsync, writeJSONAtomic, withDataLock } from '../utils.js';
import { requireAuth, requireAdmin } from '../auth.js';

const router = Router();
const SEEN_FILE = 'notifications-seen.json';

async function getSeenMap() {
  const data = await readJSONAsync(SEEN_FILE);
  return Array.isArray(data) ? {} : (data || {});
}

function hasUpdate(item, lastSeen) {
  return (item.antwortTimestamp && item.antwortTimestamp > lastSeen) ||
         (item.statusUpdatedAt && item.statusUpdatedAt > lastSeen);
}

async function resolveInboxTargetUserIds(msg, cache = {}) {
  if (msg.targetType === 'all') {
    const users = cache.users || await readJSONAsync('users.json');
    return users.map(u => u.id);
  }
  if (msg.targetType === 'users') return msg.targetUserIds || [];
  if (msg.targetType === 'group') {
    const groups = cache.groups || await readJSONAsync('user-groups.json');
    const group = groups.find(g => g.id === msg.targetGroupId);
    return group ? group.userIds : [];
  }
  if (msg.targetType === 'event') {
    const events = cache.events || await readJSONAsync('events.json');
    const regs = cache.regs || await readJSONAsync('registrations.json');
    const event = events.find(e => e.id === msg.targetEventId);
    if (!event) return [];
    const regIds = event.anmeldungen || [];
    return regs.filter(r => regIds.includes(r.id)).map(r => r.userId).filter(Boolean);
  }
  return [];
}

async function calculateUserCount(userId, userEmail, lastSeen) {
  const requests = await readJSONAsync('requests.json');
  const changes = await readJSONAsync('changes.json');
  const myRequests = requests.filter(r =>
    r.userId === userId || (r.userEmail || '').toLowerCase().trim() === userEmail
  );
  const myChanges = changes.filter(c =>
    c.userId === userId || (c.kontaktEmail || '').toLowerCase().trim() === userEmail
  );
  return myRequests.filter(r => hasUpdate(r, lastSeen)).length +
    myChanges.filter(c => hasUpdate(c, lastSeen)).length;
}

async function calculateInboxUnreadCount(userId) {
  const messagesRaw = await readJSONAsync('inbox-messages.json');
  const messages = Array.isArray(messagesRaw) ? messagesRaw : [];
  const users = await readJSONAsync('users.json');
  const groups = await readJSONAsync('user-groups.json');
  const events = await readJSONAsync('events.json');
  const regs = await readJSONAsync('registrations.json');
  const cache = { users, groups, events, regs };
  let count = 0;
  for (const msg of messages) {
    const targetIds = await resolveInboxTargetUserIds(msg, cache);
    if (targetIds.includes(userId) && !(msg.readBy || []).includes(userId)) count += 1;
  }
  return count;
}

async function calculateAdminCount(adminId) {
  const seenMap = await getSeenMap();
  const adminKey = `admin:${adminId}`;
  const seen = seenMap[adminKey] || {};
  const now = '1970-01-01T00:00:00.000Z';

  const requests = await readJSONAsync('requests.json');
  const changes = await readJSONAsync('changes.json');
  const regs = await readJSONAsync('registrations.json');
  const themen = await readJSONAsync('schulungsthemen.json');

  const counts = {
    antraege: requests.filter(r => (r.timestamp || '') > (seen.antraege || now)).length,
    changes: changes.filter(c => (c.timestamp || '') > (seen.changes || now)).length,
    events: regs.filter(r => (r.timestamp || '') > (seen.events || now)).length,
    themen: themen.filter(t => t.typ !== 'vordefiniert' && (t.erstellt || '') > (seen.themen || now)).length,
  };
  return Object.values(counts).reduce((sum, val) => sum + (Number(val) || 0), 0);
}

router.get('/count', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const userEmail = (req.user.email || '').toLowerCase().trim();
  const seenMap = await getSeenMap();
  const lastSeen = seenMap[userId] || '1970-01-01T00:00:00.000Z';
  const count = await calculateUserCount(userId, userEmail, lastSeen);
  res.json({ count });
});

router.get('/summary', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const userEmail = (req.user.email || '').toLowerCase().trim();
  const seenMap = await getSeenMap();
  const lastSeen = seenMap[userId] || '1970-01-01T00:00:00.000Z';

  const [count, inboxCount, adminCount] = await Promise.all([
    calculateUserCount(userId, userEmail, lastSeen),
    calculateInboxUnreadCount(userId),
    req.user.role === 'admin' ? calculateAdminCount(userId) : Promise.resolve(0),
  ]);

  res.json({ count, inboxCount, adminCount });
});

router.post('/seen', requireAuth, async (req, res) => {
  const userId = req.user.id;
  await withDataLock(async () => {
    const seenMap = await getSeenMap();
    seenMap[userId] = new Date().toISOString();
    await writeJSONAtomic(SEEN_FILE, seenMap);
  });
  res.json({ ok: true });
});

router.get('/admin', requireAuth, requireAdmin, async (req, res) => {
  const seenMap = await getSeenMap();
  const adminKey = `admin:${req.user.id}`;
  const seen = seenMap[adminKey] || {};
  const now = '1970-01-01T00:00:00.000Z';

  const requests = await readJSONAsync('requests.json');
  const changes = await readJSONAsync('changes.json');
  const regs = await readJSONAsync('registrations.json');
  const themen = await readJSONAsync('schulungsthemen.json');

  const counts = {
    antraege: requests.filter(r => (r.timestamp || '') > (seen.antraege || now)).length,
    changes: changes.filter(c => (c.timestamp || '') > (seen.changes || now)).length,
    events: regs.filter(r => (r.timestamp || '') > (seen.events || now)).length,
    themen: themen.filter(t => t.typ !== 'vordefiniert' && (t.erstellt || '') > (seen.themen || now)).length,
  };

  res.json(counts);
});

router.post('/admin/seen', requireAuth, requireAdmin, async (req, res) => {
  const { section } = req.body;
  if (!section) return res.status(400).json({ error: 'section required' });

  await withDataLock(async () => {
    const seenMap = await getSeenMap();
    const adminKey = `admin:${req.user.id}`;
    if (!seenMap[adminKey]) seenMap[adminKey] = {};
    seenMap[adminKey][section] = new Date().toISOString();
    await writeJSONAtomic(SEEN_FILE, seenMap);
  });
  res.json({ ok: true });
});

export default router;
