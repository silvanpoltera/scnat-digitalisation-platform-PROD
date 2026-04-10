import { Router } from 'express';
import { readJSON, writeJSON, generateId } from '../utils.js';
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

router.post('/status', requireAuth, requireAdmin, (req, res) => {
  const data = getData();
  Object.assign(data.status, req.body);
  writeJSON(FILE, data);
  res.json(data);
});

router.post('/entscheide/:id', requireAuth, requireAdmin, (req, res) => {
  const data = getData();
  const idx = data.entscheide.findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Nicht gefunden' });
  Object.assign(data.entscheide[idx], req.body);
  writeJSON(FILE, data);
  res.json(data.entscheide[idx]);
});

router.put('/backlog', requireAuth, requireAdmin, (req, res) => {
  const { titel, beschreibung, kategorie, prioritaet } = req.body;
  if (!titel) return res.status(400).json({ error: 'Titel erforderlich' });
  const data = getData();
  const newItem = { id: generateId(), titel, beschreibung, kategorie, prioritaet, status: 'offen' };
  data.backlog.push(newItem);
  writeJSON(FILE, data);
  res.status(201).json(newItem);
});

router.post('/backlog/:id', requireAuth, requireAdmin, (req, res) => {
  const data = getData();
  const idx = data.backlog.findIndex(b => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Nicht gefunden' });
  Object.assign(data.backlog[idx], req.body);
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
