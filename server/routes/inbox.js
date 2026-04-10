import { Router } from 'express';
import { readJSON, writeJSON, generateId, sanitize } from '../utils.js';
import { requireAuth, requireAdmin } from '../auth.js';

const router = Router();
const MESSAGES_FILE = 'inbox-messages.json';
const GROUPS_FILE = 'user-groups.json';

function getMessages() {
  const data = readJSON(MESSAGES_FILE);
  return Array.isArray(data) ? data : [];
}

function getGroups() {
  const data = readJSON(GROUPS_FILE);
  return Array.isArray(data) ? data : [];
}

function resolveTargetUserIds(msg) {
  if (msg.targetType === 'all') {
    const users = readJSON('users.json');
    return users.map(u => u.id);
  }
  if (msg.targetType === 'users') {
    return msg.targetUserIds || [];
  }
  if (msg.targetType === 'group') {
    const groups = getGroups();
    const group = groups.find(g => g.id === msg.targetGroupId);
    return group ? group.userIds : [];
  }
  if (msg.targetType === 'event') {
    const events = readJSON('events.json');
    const ev = events.find(e => e.id === msg.targetEventId);
    if (!ev) return [];
    const regIds = ev.anmeldungen || [];
    const regs = readJSON('registrations.json');
    return regs.filter(r => regIds.includes(r.id)).map(r => r.userId).filter(Boolean);
  }
  return [];
}

// ─── User endpoints ──────────────────────────────────────

router.get('/mine', requireAuth, (req, res) => {
  const userId = req.user.id;
  const messages = getMessages();
  const mine = messages
    .filter(m => resolveTargetUserIds(m).includes(userId))
    .map(m => ({
      id: m.id,
      title: m.title,
      message: m.message,
      priority: m.priority,
      createdAt: m.createdAt,
      createdByName: m.createdByName,
      read: (m.readBy || []).includes(userId),
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  res.json(mine);
});

router.get('/unread-count', requireAuth, (req, res) => {
  const userId = req.user.id;
  const messages = getMessages();
  const count = messages.filter(m =>
    resolveTargetUserIds(m).includes(userId) && !(m.readBy || []).includes(userId)
  ).length;
  res.json({ count });
});

router.post('/:id/read', requireAuth, (req, res) => {
  const userId = req.user.id;
  const messages = getMessages();
  const msg = messages.find(m => m.id === req.params.id);
  if (!msg) return res.status(404).json({ error: 'Nachricht nicht gefunden' });

  if (!resolveTargetUserIds(msg).includes(userId)) {
    return res.status(403).json({ error: 'Kein Zugriff auf diese Nachricht' });
  }

  if (!msg.readBy) msg.readBy = [];
  if (!msg.readBy.includes(userId)) {
    msg.readBy.push(userId);
    writeJSON(MESSAGES_FILE, messages);
  }
  res.json({ ok: true });
});

router.post('/read-all', requireAuth, (req, res) => {
  const userId = req.user.id;
  const messages = getMessages();
  let changed = false;
  for (const msg of messages) {
    if (resolveTargetUserIds(msg).includes(userId) && !(msg.readBy || []).includes(userId)) {
      if (!msg.readBy) msg.readBy = [];
      msg.readBy.push(userId);
      changed = true;
    }
  }
  if (changed) writeJSON(MESSAGES_FILE, messages);
  res.json({ ok: true });
});

// ─── Admin endpoints ─────────────────────────────────────

router.get('/admin/all', requireAuth, requireAdmin, (req, res) => {
  const messages = getMessages();
  const users = readJSON('users.json');
  const groups = getGroups();
  const events = readJSON('events.json');

  const enriched = messages.map(m => {
    const targetIds = resolveTargetUserIds(m);
    const readCount = (m.readBy || []).filter(id => targetIds.includes(id)).length;
    let targetLabel = '';
    if (m.targetType === 'all') targetLabel = 'Alle User';
    else if (m.targetType === 'users') {
      targetLabel = (m.targetUserIds || [])
        .map(id => users.find(u => u.id === id)?.name || id)
        .join(', ');
    } else if (m.targetType === 'group') {
      const g = groups.find(g => g.id === m.targetGroupId);
      targetLabel = g ? `Gruppe: ${g.name}` : 'Unbekannte Gruppe';
    } else if (m.targetType === 'event') {
      const ev = events.find(e => e.id === m.targetEventId);
      targetLabel = ev ? `Event: ${ev.titel}` : 'Unbekanntes Event';
    }

    return {
      ...m,
      targetLabel,
      targetCount: targetIds.length,
      readCount,
    };
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  res.json(enriched);
});

router.post('/admin', requireAuth, requireAdmin, (req, res) => {
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

  const messages = getMessages();
  messages.push(newMsg);
  writeJSON(MESSAGES_FILE, messages);

  res.json(newMsg);
});

router.delete('/admin/:id', requireAuth, requireAdmin, (req, res) => {
  let messages = getMessages();
  const before = messages.length;
  messages = messages.filter(m => m.id !== req.params.id);
  if (messages.length === before) return res.status(404).json({ error: 'Nicht gefunden' });
  writeJSON(MESSAGES_FILE, messages);
  res.json({ ok: true });
});

// ─── User Groups ─────────────────────────────────────────

router.get('/groups', requireAuth, requireAdmin, (req, res) => {
  const groups = getGroups();
  const users = readJSON('users.json');
  const enriched = groups.map(g => ({
    ...g,
    members: (g.userIds || []).map(id => {
      const u = users.find(u => u.id === id);
      return u ? { id: u.id, name: u.name, email: u.email } : { id, name: id, email: '' };
    }),
  }));
  res.json(enriched);
});

router.post('/groups', requireAuth, requireAdmin, (req, res) => {
  const { name, userIds } = sanitize(req.body);
  if (!name || !userIds?.length) return res.status(400).json({ error: 'name and userIds required' });

  const groups = getGroups();
  const group = {
    id: generateId(),
    name,
    userIds,
    createdAt: new Date().toISOString(),
  };
  groups.push(group);
  writeJSON(GROUPS_FILE, groups);
  res.json(group);
});

router.put('/groups/:id', requireAuth, requireAdmin, (req, res) => {
  const groups = getGroups();
  const idx = groups.findIndex(g => g.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Gruppe nicht gefunden' });

  const { name, userIds } = sanitize(req.body);
  if (name) groups[idx].name = name;
  if (userIds) groups[idx].userIds = userIds;
  writeJSON(GROUPS_FILE, groups);
  res.json(groups[idx]);
});

router.delete('/groups/:id', requireAuth, requireAdmin, (req, res) => {
  let groups = getGroups();
  const before = groups.length;
  groups = groups.filter(g => g.id !== req.params.id);
  if (groups.length === before) return res.status(404).json({ error: 'Nicht gefunden' });
  writeJSON(GROUPS_FILE, groups);
  res.json({ ok: true });
});

export default router;
