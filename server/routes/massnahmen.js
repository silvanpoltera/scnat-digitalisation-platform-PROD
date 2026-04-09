import { Router } from 'express';
import { readJSON, writeJSON, generateId } from '../utils.js';
import { requireAuth, requireAdmin } from '../auth.js';

const router = Router();
const FILE = 'massnahmen.json';

router.get('/', requireAuth, (_req, res) => {
  res.json(readJSON(FILE));
});

router.post('/:id', requireAuth, requireAdmin, (req, res) => {
  const data = readJSON(FILE);
  const idx = data.findIndex(m => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Nicht gefunden' });

  const allowed = [
    'titel', 'beschreibung', 'cluster', 'status', 'notiz', 'tags',
    'wirkung', 'aufwand', 'prioritaet', 'prioritaet_label',
    'start_empfohlen', 'scnat_db', 'scnat_portal',
    'isNew', 'reihenfolge',
  ];
  allowed.forEach(key => {
    if (req.body[key] !== undefined) data[idx][key] = req.body[key];
  });

  writeJSON(FILE, data);
  res.json(data[idx]);
});

router.put('/', requireAuth, requireAdmin, (req, res) => {
  const data = readJSON(FILE);
  const newItem = { id: generateId(), ...req.body, status: req.body.status || 'geplant' };
  data.push(newItem);
  writeJSON(FILE, data);
  res.status(201).json(newItem);
});

router.post('/reorder', requireAuth, requireAdmin, (req, res) => {
  const { order } = req.body;
  if (!Array.isArray(order)) return res.status(400).json({ error: 'order must be an array' });

  const data = readJSON(FILE);
  order.forEach(({ id, reihenfolge }) => {
    const item = data.find(m => m.id === id);
    if (item) item.reihenfolge = reihenfolge;
  });
  writeJSON(FILE, data);
  res.json({ ok: true });
});

export default router;
