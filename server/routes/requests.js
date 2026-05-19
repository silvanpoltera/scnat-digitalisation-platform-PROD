import { Router } from 'express';
import { readJSON, writeJSON, generateId, sanitize } from '../utils.js';
import { requireAuth, requireAdmin } from '../auth.js';
import { sendToUser, sendToAdmins, fireAndForget } from '../push.js';

const router = Router();
const FILE = 'requests.json';
const ALLOWED_STATUS = new Set(['offen', 'in Prüfung', 'bewilligt', 'abgelehnt']);

function getTrimmedString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

router.get('/', requireAuth, requireAdmin, (_req, res) => {
  res.json(readJSON(FILE));
});

router.post('/', requireAuth, (req, res) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ error: 'Ungültiger Request-Body' });
  }
  const { titel, beschreibung, typ, kontakt, kontaktEmail } = sanitize(req.body);
  const cleanTitle = getTrimmedString(titel);
  if (!cleanTitle) return res.status(400).json({ error: 'Titel erforderlich' });
  const data = readJSON(FILE);
  const newItem = {
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
  writeJSON(FILE, data);

  fireAndForget(sendToAdmins({
    title: 'Neuer Softwareantrag',
    body: `${newItem.titel} — von ${newItem.userName || 'User'}`,
    url: '/cp/antraege',
    tag: `request-new-${newItem.id}`,
  }));

  res.status(201).json(newItem);
});

router.get('/mine', requireAuth, (req, res) => {
  const data = readJSON(FILE);
  const userEmail = (req.user.email || '').toLowerCase().trim();
  const userId = req.user.id;
  const mine = data.filter(r =>
    r.userId === userId || (r.userEmail || '').toLowerCase().trim() === userEmail
  );
  res.json(mine);
});

router.post('/:id/status', requireAuth, requireAdmin, (req, res) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ error: 'Ungültiger Request-Body' });
  }
  const { status, antwort } = sanitize(req.body);
  const cleanStatus = getTrimmedString(status);
  if (!cleanStatus) return res.status(400).json({ error: 'Status erforderlich' });
  if (!ALLOWED_STATUS.has(cleanStatus)) {
    return res.status(400).json({ error: 'Ungültiger Statuswert' });
  }
  const data = readJSON(FILE);
  const idx = data.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Nicht gefunden' });
  data[idx].status = cleanStatus;
  data[idx].statusUpdatedAt = new Date().toISOString();
  if (antwort !== undefined) data[idx].antwort = typeof antwort === 'string' ? antwort : '';
  writeJSON(FILE, data);

  if (data[idx].userId) {
    fireAndForget(sendToUser(data[idx].userId, {
      title: 'Status deines Antrags geändert',
      body: `${data[idx].titel} → ${status}`,
      url: '/meine-uebersicht',
      tag: `request-status-${data[idx].id}`,
    }));
  }

  res.json(data[idx]);
});

router.post('/:id/reply', requireAuth, requireAdmin, (req, res) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ error: 'Ungültiger Request-Body' });
  }
  const data = readJSON(FILE);
  const idx = data.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Nicht gefunden' });
  const { antwort } = sanitize(req.body);
  if (antwort !== undefined && typeof antwort !== 'string') {
    return res.status(400).json({ error: 'Antwort muss Text sein' });
  }
  data[idx].antwort = antwort || '';
  data[idx].antwortTimestamp = new Date().toISOString();
  writeJSON(FILE, data);

  if (data[idx].userId) {
    fireAndForget(sendToUser(data[idx].userId, {
      title: 'Antwort auf deinen Antrag',
      body: data[idx].titel || 'Neue Antwort vom Team',
      url: '/meine-uebersicht',
      tag: `request-reply-${data[idx].id}`,
    }));
  }

  res.json(data[idx]);
});

export default router;
