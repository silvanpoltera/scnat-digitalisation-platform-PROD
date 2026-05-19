import { Router } from 'express';
import { readJSONAsync, writeJSONAtomic, withDataLock, generateId, sanitize } from '../utils.js';
import { requireAuth, requireAdmin } from '../auth.js';
import { sendToUser, sendToAdmins, fireAndForget } from '../push.js';

const router = Router();
const FILE = 'changes.json';

function getTrimmedString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

router.get('/', requireAuth, requireAdmin, async (_req, res) => {
  res.json(await readJSONAsync(FILE));
});

router.get('/mine', requireAuth, async (req, res) => {
  const data = await readJSONAsync(FILE);
  const userEmail = (req.user.email || '').toLowerCase().trim();
  const userId = req.user.id;
  const mine = data.filter(c =>
    c.userId === userId || (c.kontaktEmail || '').toLowerCase().trim() === userEmail
  );
  res.json(mine);
});

router.post('/', requireAuth, async (req, res) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ error: 'Ungültiger Request-Body' });
  }
  const { titel, beschreibung, typ, system, kontakt, kontaktEmail } = sanitize(req.body);
  const cleanTitle = getTrimmedString(titel);
  if (!cleanTitle) return res.status(400).json({ error: 'Titel erforderlich' });
  let newItem;
  await withDataLock(async () => {
    const data = await readJSONAsync(FILE);
    newItem = {
      id: generateId(),
      titel: cleanTitle,
      beschreibung: beschreibung || '',
      typ: typ || 'allgemein',
      system: system || '',
      kontakt: kontakt || req.user.name,
      kontaktEmail: kontaktEmail || req.user.email,
      status: 'eingereicht',
      cluster: '',
      massnahmeId: '',
      adminNotiz: '',
      antwort: '',
      antwortTimestamp: null,
      userId: req.user.id,
      userEmail: req.user.email,
      timestamp: new Date().toISOString(),
    };
    data.push(newItem);
    await writeJSONAtomic(FILE, data);
  });

  fireAndForget(sendToAdmins({
    title: 'Neuer Change-Vorschlag',
    body: `${newItem.titel} — von ${newItem.kontakt || 'User'}`,
    url: '/cp/changes',
    tag: `change-new-${newItem.id}`,
  }));

  res.status(201).json(newItem);
});

router.post('/:id', requireAuth, requireAdmin, async (req, res) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ error: 'Ungültiger Request-Body' });
  }
  const clean = sanitize(req.body);
  let updated;
  let statusChanged = false;
  await withDataLock(async () => {
    const data = await readJSONAsync(FILE);
    const idx = data.findIndex(c => c.id === req.params.id);
    if (idx === -1) return;

    const oldStatus = data[idx].status;
    const allowed = ['status', 'cluster', 'massnahmeId', 'adminNotiz'];
    allowed.forEach(key => {
      if (clean[key] !== undefined) data[idx][key] = clean[key];
    });
    statusChanged = Boolean(clean.status && clean.status !== oldStatus);
    if (statusChanged) {
      data[idx].statusUpdatedAt = new Date().toISOString();
    }
    updated = data[idx];
    await writeJSONAtomic(FILE, data);
  });
  if (!updated) return res.status(404).json({ error: 'Nicht gefunden' });

  if (statusChanged && updated.userId) {
    fireAndForget(sendToUser(updated.userId, {
      title: 'Status deines Change-Vorschlags geändert',
      body: `${updated.titel || 'Change'} → ${updated.status}`,
      url: '/meine-uebersicht',
      tag: `change-status-${updated.id}`,
    }));
  }

  res.json(updated);
});

router.post('/:id/reply', requireAuth, requireAdmin, async (req, res) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ error: 'Ungültiger Request-Body' });
  }
  const { antwort } = sanitize(req.body);
  if (antwort !== undefined && typeof antwort !== 'string') {
    return res.status(400).json({ error: 'Antwort muss Text sein' });
  }
  let updated;
  await withDataLock(async () => {
    const data = await readJSONAsync(FILE);
    const idx = data.findIndex(c => c.id === req.params.id);
    if (idx === -1) return;
    data[idx].antwort = antwort || '';
    data[idx].antwortTimestamp = new Date().toISOString();
    updated = data[idx];
    await writeJSONAtomic(FILE, data);
  });
  if (!updated) return res.status(404).json({ error: 'Nicht gefunden' });

  if (updated.userId) {
    fireAndForget(sendToUser(updated.userId, {
      title: 'Antwort auf deinen Change-Vorschlag',
      body: updated.titel || 'Neue Antwort vom Team',
      url: '/meine-uebersicht',
      tag: `change-reply-${updated.id}`,
    }));
  }

  res.json(updated);
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  await withDataLock(async () => {
    let data = await readJSONAsync(FILE);
    data = data.filter(c => c.id !== req.params.id);
    await writeJSONAtomic(FILE, data);
  });
  res.json({ ok: true });
});

export default router;
