import { Router } from 'express';
import { readJSON, writeJSON, generateId, pick, sanitize } from '../utils.js';
import { requireAuth, requireAdmin } from '../auth.js';

const router = Router();
const FILE = 'scnat-infra.json';

function getData() {
  const raw = readJSON(FILE);
  if (Array.isArray(raw)) return { status: {}, entscheide: [], backlog: [] };
  return raw;
}

router.get('/', requireAuth, (_req, res) => {
  res.json(getData());
});

const STATUS_KEYS = ['konsolidierung', 'migration', 'timeline', 'phase', 'fortschritt', 'notiz'];

router.post('/status', requireAuth, requireAdmin, (req, res) => {
  const data = getData();
  const updates = pick(sanitize(req.body), STATUS_KEYS);
  Object.assign(data.status, updates);
  writeJSON(FILE, data);
  res.json(data);
});

const ENTSCHEID_KEYS = ['titel', 'beschreibung', 'status', 'prioritaet', 'notiz', 'deadline', 'entscheidung'];

router.post('/entscheide/:id', requireAuth, requireAdmin, (req, res) => {
  const data = getData();
  const idx = data.entscheide.findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Nicht gefunden' });
  const updates = pick(sanitize(req.body), ENTSCHEID_KEYS);
  Object.assign(data.entscheide[idx], updates);
  writeJSON(FILE, data);
  res.json(data.entscheide[idx]);
});

router.put('/backlog', requireAuth, requireAdmin, (req, res) => {
  const { titel, beschreibung, kategorie, prioritaet } = sanitize(req.body);
  if (!titel) return res.status(400).json({ error: 'Titel erforderlich' });
  const data = getData();
  const newItem = { id: generateId(), titel, beschreibung, kategorie, prioritaet, status: 'offen' };
  data.backlog.push(newItem);
  writeJSON(FILE, data);
  res.status(201).json(newItem);
});

const BACKLOG_KEYS = ['titel', 'beschreibung', 'kategorie', 'prioritaet', 'status'];

router.post('/backlog/:id', requireAuth, requireAdmin, (req, res) => {
  const data = getData();
  const idx = data.backlog.findIndex(b => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Nicht gefunden' });
  const updates = pick(sanitize(req.body), BACKLOG_KEYS);
  Object.assign(data.backlog[idx], updates);
  writeJSON(FILE, data);
  res.json(data.backlog[idx]);
});

router.delete('/backlog/:id', requireAuth, requireAdmin, (req, res) => {
  const data = getData();
  data.backlog = data.backlog.filter(b => b.id !== req.params.id);
  writeJSON(FILE, data);
  res.json({ ok: true });
});

export default router;
