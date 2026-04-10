import { Router } from 'express';
import { readJSON, writeJSON, generateId, sanitize } from '../utils.js';
import { requireAuth, requireAdmin } from '../auth.js';

const router = Router();
const FILE = 'requests.json';

router.get('/', requireAuth, requireAdmin, (_req, res) => {
  res.json(readJSON(FILE));
});

router.post('/', requireAuth, (req, res) => {
  const { titel, beschreibung, typ, kontakt, kontaktEmail } = sanitize(req.body);
  if (!titel) return res.status(400).json({ error: 'Titel erforderlich' });
  const data = readJSON(FILE);
  const newItem = {
    id: generateId(),
    titel,
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
  const { status, antwort } = req.body;
  if (!status) return res.status(400).json({ error: 'Status erforderlich' });
  const data = readJSON(FILE);
  const idx = data.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Nicht gefunden' });
  data[idx].status = status;
  data[idx].statusUpdatedAt = new Date().toISOString();
  if (antwort !== undefined) data[idx].antwort = antwort;
  writeJSON(FILE, data);
  res.json(data[idx]);
});

router.post('/:id/reply', requireAuth, requireAdmin, (req, res) => {
  const data = readJSON(FILE);
  const idx = data.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Nicht gefunden' });
  data[idx].antwort = req.body.antwort;
  data[idx].antwortTimestamp = new Date().toISOString();
  writeJSON(FILE, data);
  res.json(data[idx]);
});

export default router;
