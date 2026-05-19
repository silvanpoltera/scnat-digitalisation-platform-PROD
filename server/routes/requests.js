import { Router } from 'express';
import { readJSONAsync, writeJSONAtomic, withDataLock, generateId, sanitize } from '../utils.js';
import { requireAuth, requireAdmin } from '../auth.js';
import { sendToUser, sendToAdmins, fireAndForget } from '../push.js';

const router = Router();
const FILE = 'requests.json';
const ALLOWED_STATUS = new Set(['offen', 'in Prüfung', 'bewilligt', 'abgelehnt']);

function getTrimmedString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

router.get('/', requireAuth, requireAdmin, async (_req, res) => {
  res.json(await readJSONAsync(FILE));
});

router.post('/', requireAuth, async (req, res) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ error: 'Ungültiger Request-Body' });
  }
  const { titel, beschreibung, typ, kontakt, kontaktEmail } = sanitize(req.body);
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
      kontakt: kontakt || req.user.name,
      kontaktEmail: kontaktEmail || req.user.email,
      status: 'offen',
      userId: req.user.id,
      userName: kontakt || req.user.name,
      userEmail: kontaktEmail || req.user.email,
      timestamp: new Date().toISOString(),
    };
    data.push(newItem);
    await writeJSONAtomic(FILE, data);
  });

  fireAndForget(sendToAdmins({
    title: 'Neuer Softwareantrag',
    body: `${newItem.titel} — von ${newItem.userName || 'User'}`,
    url: '/cp/antraege',
    tag: `request-new-${newItem.id}`,
  }));

  res.status(201).json(newItem);
});

router.get('/mine', requireAuth, async (req, res) => {
  const data = await readJSONAsync(FILE);
  const userEmail = (req.user.email || '').toLowerCase().trim();
  const userId = req.user.id;
  const mine = data.filter(r =>
    r.userId === userId || (r.userEmail || '').toLowerCase().trim() === userEmail
  );
  res.json(mine);
});

router.post('/:id/status', requireAuth, requireAdmin, async (req, res) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ error: 'Ungültiger Request-Body' });
  }
  const { status, antwort } = sanitize(req.body);
  const cleanStatus = getTrimmedString(status);
  if (!cleanStatus) return res.status(400).json({ error: 'Status erforderlich' });
  if (!ALLOWED_STATUS.has(cleanStatus)) {
    return res.status(400).json({ error: 'Ungültiger Statuswert' });
  }
  let updated;
  await withDataLock(async () => {
    const data = await readJSONAsync(FILE);
    const idx = data.findIndex(r => r.id === req.params.id);
    if (idx === -1) return;
    data[idx].status = cleanStatus;
    data[idx].statusUpdatedAt = new Date().toISOString();
    if (antwort !== undefined) data[idx].antwort = typeof antwort === 'string' ? antwort : '';
    updated = data[idx];
    await writeJSONAtomic(FILE, data);
  });
  if (!updated) return res.status(404).json({ error: 'Nicht gefunden' });

  if (updated.userId) {
    fireAndForget(sendToUser(updated.userId, {
      title: 'Status deines Antrags geändert',
      body: `${updated.titel} → ${cleanStatus}`,
      url: '/meine-uebersicht',
      tag: `request-status-${updated.id}`,
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
    const idx = data.findIndex(r => r.id === req.params.id);
    if (idx === -1) return;
    data[idx].antwort = antwort || '';
    data[idx].antwortTimestamp = new Date().toISOString();
    updated = data[idx];
    await writeJSONAtomic(FILE, data);
  });
  if (!updated) return res.status(404).json({ error: 'Nicht gefunden' });

  if (updated.userId) {
    fireAndForget(sendToUser(updated.userId, {
      title: 'Antwort auf deinen Antrag',
      body: updated.titel || 'Neue Antwort vom Team',
      url: '/meine-uebersicht',
      tag: `request-reply-${updated.id}`,
    }));
  }

  res.json(updated);
});

export default router;
