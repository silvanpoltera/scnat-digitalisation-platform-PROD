import { Router } from 'express';
import { readJSON, writeJSON, generateId, sanitize } from '../utils.js';
import { requireAuth, requireAdmin } from '../auth.js';

const router = Router();
const FILE = 'changes.json';

router.get('/', requireAuth, requireAdmin, (_req, res) => {
  res.json(readJSON(FILE));
});

router.get('/mine', requireAuth, (req, res) => {
  const data = readJSON(FILE);
  const userEmail = (req.user.email || '').toLowerCase().trim();
  const userId = req.user.id;
  const mine = data.filter(c =>
    c.userId === userId || (c.kontaktEmail || '').toLowerCase().trim() === userEmail
  );
  res.json(mine);
});

router.post('/', requireAuth, (req, res) => {
  const { titel, beschreibung, typ, system, kontakt, kontaktEmail } = sanitize(req.body);
  if (!titel) return res.status(400).json({ error: 'Titel erforderlich' });
  const data = readJSON(FILE);
  const newItem = {
    id: generateId(),
    titel: titel || '',
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
  writeJSON(FILE, data);
  res.status(201).json(newItem);
});

router.post('/:id', requireAuth, requireAdmin, (req, res) => {
  const data = readJSON(FILE);
  const idx = data.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Nicht gefunden' });

  const oldStatus = data[idx].status;
  const clean = sanitize(req.body);
  const allowed = ['status', 'cluster', 'massnahmeId', 'adminNotiz'];
  allowed.forEach(key => {
    if (clean[key] !== undefined) data[idx][key] = clean[key];
  });
  if (req.body.status && req.body.status !== oldStatus) {
    data[idx].statusUpdatedAt = new Date().toISOString();
  }

  writeJSON(FILE, data);
  res.json(data[idx]);
});

router.post('/:id/reply', requireAuth, requireAdmin, (req, res) => {
  const data = readJSON(FILE);
  const idx = data.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Nicht gefunden' });

  const { antwort } = sanitize(req.body);
  data[idx].antwort = antwort || '';
  data[idx].antwortTimestamp = new Date().toISOString();
  writeJSON(FILE, data);
  res.json(data[idx]);
});

router.delete('/:id', requireAuth, requireAdmin, (req, res) => {
  let data = readJSON(FILE);
  data = data.filter(c => c.id !== req.params.id);
  writeJSON(FILE, data);
  res.json({ ok: true });
});

export default router;
