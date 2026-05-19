import { Router } from 'express';
import { readJSONAsync, writeJSONAtomic, generateId, sanitize, withDataLock } from '../utils.js';
import { requireAuth, requireAdmin } from '../auth.js';
import { sendToUsers, fireAndForget } from '../push.js';

const router = Router();
const MESSAGES_FILE = 'inbox-messages.json';
const GROUPS_FILE = 'user-groups.json';

function getMessages() {
  const data = readJSONAsync(MESSAGES_FILE);
  return data.then(value => (Array.isArray(value) ? value : []));
}

async function getGroups() {
  const data = await readJSONAsync(GROUPS_FILE);
  return Array.isArray(data) ? data : [];
}

async function resolveTargetUserIds(msg, cache = {}) {
  if (msg.targetType === 'all') {
    const users = cache.users || await readJSONAsync('users.json');
    return users.map(u => u.id);
  }
  if (msg.targetType === 'users') {
    return msg.targetUserIds || [];
  }
  if (msg.targetType === 'group') {
    const groups = cache.groups || await getGroups();
    const group = groups.find(g => g.id === msg.targetGroupId);
    return group ? group.userIds : [];
  }
  if (msg.targetType === 'event') {
    const events = cache.events || await readJSONAsync('events.json');
    const ev = events.find(e => e.id === msg.targetEventId);
    if (!ev) return [];
    const regIds = ev.anmeldungen || [];
    const regs = cache.regs || await readJSONAsync('registrations.json');
    return regs.filter(r => regIds.includes(r.id)).map(r => r.userId).filter(Boolean);
  }
  return [];
}

// ─── User endpoints ──────────────────────────────────────

router.get('/mine', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const messages = await getMessages();
  const users = await readJSONAsync('users.json');
  const groups = await getGroups();
  const events = await readJSONAsync('events.json');
  const regs = await readJSONAsync('registrations.json');
  const cache = { users, groups, events, regs };

  const mine = [];
  for (const msg of messages) {
    const targetIds = await resolveTargetUserIds(msg, cache);
    if (!targetIds.includes(userId)) continue;
    mine.push({
      id: msg.id,
      title: msg.title,
      message: msg.message,
      priority: msg.priority,
      createdAt: msg.createdAt,
      createdByName: msg.createdByName,
      read: (msg.readBy || []).includes(userId),
    });
  }
  mine.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  res.json(mine);
});

router.get('/unread-count', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const messages = await getMessages();
  const users = await readJSONAsync('users.json');
  const groups = await getGroups();
  const events = await readJSONAsync('events.json');
  const regs = await readJSONAsync('registrations.json');
  const cache = { users, groups, events, regs };
  let count = 0;
  for (const msg of messages) {
    const targetIds = await resolveTargetUserIds(msg, cache);
    if (targetIds.includes(userId) && !(msg.readBy || []).includes(userId)) count += 1;
  }
  res.json({ count });
});

router.post('/:id/read', requireAuth, async (req, res) => {
  const userId = req.user.id;
  let notFound = false;
  let forbidden = false;

  await withDataLock(async () => {
    const messages = await getMessages();
    const users = await readJSONAsync('users.json');
    const groups = await getGroups();
    const events = await readJSONAsync('events.json');
    const regs = await readJSONAsync('registrations.json');
    const cache = { users, groups, events, regs };

    const msg = messages.find(m => m.id === req.params.id);
    if (!msg) {
      notFound = true;
      return;
    }

    if (!(await resolveTargetUserIds(msg, cache)).includes(userId)) {
      forbidden = true;
      return;
    }

    if (!msg.readBy) msg.readBy = [];
    if (!msg.readBy.includes(userId)) {
      msg.readBy.push(userId);
      await writeJSONAtomic(MESSAGES_FILE, messages);
    }
  });

  if (notFound) return res.status(404).json({ error: 'Nachricht nicht gefunden' });
  if (forbidden) return res.status(403).json({ error: 'Kein Zugriff auf diese Nachricht' });
  res.json({ ok: true });
});

router.post('/read-all', requireAuth, async (req, res) => {
  const userId = req.user.id;

  await withDataLock(async () => {
    const messages = await getMessages();
    const users = await readJSONAsync('users.json');
    const groups = await getGroups();
    const events = await readJSONAsync('events.json');
    const regs = await readJSONAsync('registrations.json');
    const cache = { users, groups, events, regs };

    let changed = false;
    for (const msg of messages) {
      if ((await resolveTargetUserIds(msg, cache)).includes(userId) && !(msg.readBy || []).includes(userId)) {
        if (!msg.readBy) msg.readBy = [];
        msg.readBy.push(userId);
        changed = true;
      }
    }
    if (changed) await writeJSONAtomic(MESSAGES_FILE, messages);
  });

  res.json({ ok: true });
});

// ─── Admin endpoints ─────────────────────────────────────

router.get('/admin/all', requireAuth, requireAdmin, async (req, res) => {
  const messages = await getMessages();
  const users = await readJSONAsync('users.json');
  const groups = await getGroups();
  const events = await readJSONAsync('events.json');
  const regs = await readJSONAsync('registrations.json');
  const cache = { users, groups, events, regs };

  const enriched = [];
  for (const msg of messages) {
    const targetIds = await resolveTargetUserIds(msg, cache);
    const readCount = (msg.readBy || []).filter(id => targetIds.includes(id)).length;
    let targetLabel = '';
    if (msg.targetType === 'all') targetLabel = 'Alle User';
    else if (msg.targetType === 'users') {
      targetLabel = (msg.targetUserIds || [])
        .map(id => users.find(u => u.id === id)?.name || id)
        .join(', ');
    } else if (msg.targetType === 'group') {
      const g = groups.find(group => group.id === msg.targetGroupId);
      targetLabel = g ? `Gruppe: ${g.name}` : 'Unbekannte Gruppe';
    } else if (msg.targetType === 'event') {
      const ev = events.find(event => event.id === msg.targetEventId);
      targetLabel = ev ? `Event: ${ev.titel}` : 'Unbekanntes Event';
    }

    enriched.push({
      ...msg,
      targetLabel,
      targetCount: targetIds.length,
      readCount,
    });
  }
  enriched.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  res.json(enriched);
});

router.post('/admin', requireAuth, requireAdmin, async (req, res) => {
  const { title, message, priority, targetType, targetUserIds, targetGroupId, targetEventId } = sanitize(req.body);
  if (!title || !message || !targetType) {
    return res.status(400).json({ error: 'title, message, targetType required' });
  }

  const newMsg = {
    id: generateId(),
    title,
    message,
    priority: priority || 'normal',
    targetType,
    targetUserIds: targetType === 'users' ? targetUserIds : undefined,
    targetGroupId: targetType === 'group' ? targetGroupId : undefined,
    targetEventId: targetType === 'event' ? targetEventId : undefined,
    createdAt: new Date().toISOString(),
    createdBy: req.user.id,
    createdByName: req.user.name || 'Admin',
    readBy: [],
  };

  let targetIds = [];
  await withDataLock(async () => {
    const messages = await getMessages();
    messages.push(newMsg);
    await writeJSONAtomic(MESSAGES_FILE, messages);

    const users = await readJSONAsync('users.json');
    const groups = await getGroups();
    const events = await readJSONAsync('events.json');
    const regs = await readJSONAsync('registrations.json');
    targetIds = await resolveTargetUserIds(newMsg, { users, groups, events, regs });
  });

  if (targetIds.length) {
    fireAndForget(sendToUsers(targetIds, {
      title: newMsg.title,
      body: newMsg.message,
      url: '/meine-uebersicht',
      tag: `inbox-${newMsg.id}`,
    }));
  }

  res.json(newMsg);
});

router.delete('/admin/:id', requireAuth, requireAdmin, async (req, res) => {
  let notFound = false;
  await withDataLock(async () => {
    const messages = await getMessages();
    const filtered = messages.filter(m => m.id !== req.params.id);
    if (filtered.length === messages.length) {
      notFound = true;
      return;
    }
    await writeJSONAtomic(MESSAGES_FILE, filtered);
  });

  if (notFound) return res.status(404).json({ error: 'Nicht gefunden' });
  res.json({ ok: true });
});

// ─── User Groups ─────────────────────────────────────────

router.get('/groups', requireAuth, requireAdmin, async (req, res) => {
  const groups = await getGroups();
  const users = await readJSONAsync('users.json');
  const enriched = groups.map(g => ({
    ...g,
    members: (g.userIds || []).map(id => {
      const u = users.find(user => user.id === id);
      return u ? { id: u.id, name: u.name, email: u.email } : { id, name: id, email: '' };
    }),
  }));
  res.json(enriched);
});

router.post('/groups', requireAuth, requireAdmin, async (req, res) => {
  const { name, userIds } = sanitize(req.body);
  if (!name || !userIds?.length) return res.status(400).json({ error: 'name and userIds required' });

  let group;
  await withDataLock(async () => {
    const groups = await getGroups();
    group = {
      id: generateId(),
      name,
      userIds,
      createdAt: new Date().toISOString(),
    };
    groups.push(group);
    await writeJSONAtomic(GROUPS_FILE, groups);
  });
  res.json(group);
});

router.put('/groups/:id', requireAuth, requireAdmin, async (req, res) => {
  const { name, userIds } = sanitize(req.body);
  let updatedGroup;
  await withDataLock(async () => {
    const groups = await getGroups();
    const idx = groups.findIndex(g => g.id === req.params.id);
    if (idx === -1) return;

    if (name) groups[idx].name = name;
    if (userIds) groups[idx].userIds = userIds;
    updatedGroup = groups[idx];
    await writeJSONAtomic(GROUPS_FILE, groups);
  });

  if (!updatedGroup) return res.status(404).json({ error: 'Gruppe nicht gefunden' });
  res.json(updatedGroup);
});

router.delete('/groups/:id', requireAuth, requireAdmin, async (req, res) => {
  let removed = false;
  await withDataLock(async () => {
    const groups = await getGroups();
    const filtered = groups.filter(g => g.id !== req.params.id);
    if (filtered.length === groups.length) return;
    removed = true;
    await writeJSONAtomic(GROUPS_FILE, filtered);
  });

  if (!removed) return res.status(404).json({ error: 'Nicht gefunden' });
  res.json({ ok: true });
});

export default router;
