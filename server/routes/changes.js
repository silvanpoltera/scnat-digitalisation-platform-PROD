import { Router } from 'express';
import { readJSON, writeJSON, generateId } from '../utils.js';
import { requireAuth, requireAdmin } from '../auth.js';

const router = Router();
const FILE = 'changes.json';

router.get('/', requireAuth, (_req, res) => {
  res.json(readJSON(FILE));
});

router.post('/', requireAuth, (req, res) => {
  const data = readJSON(FILE);
  const newItem = {
    id: generateId(),
    ...req.body,
    status: 'eingereicht',
    cluster: '',
    massnahmeId: '',
    adminNotiz: '',
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

  const allowed = ['status', 'cluster', 'massnahmeId', 'adminNotiz'];
  allowed.forEach(key => {
    if (req.body[key] !== undefined) data[idx][key] = req.body[key];
  });

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
