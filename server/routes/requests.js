import { Router } from 'express';
import { readJSON, writeJSON, generateId } from '../utils.js';
import { requireAuth, requireAdmin } from '../auth.js';

const router = Router();
const FILE = 'requests.json';

router.get('/', requireAuth, (_req, res) => {
  res.json(readJSON(FILE));
});

router.post('/', requireAuth, (req, res) => {
  const data = readJSON(FILE);
  const newItem = {
    id: generateId(),
    ...req.body,
    status: 'offen',
    userId: req.user.id,
    userName: req.body.kontakt || req.user.name,
    userEmail: req.body.kontaktEmail || req.user.email,
    timestamp: new Date().toISOString(),
  };
  data.push(newItem);
  writeJSON(FILE, data);
  res.status(201).json(newItem);
});

router.post('/:id/status', requireAuth, requireAdmin, (req, res) => {
  const data = readJSON(FILE);
  const idx = data.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Nicht gefunden' });
  data[idx].status = req.body.status;
  writeJSON(FILE, data);
  res.json(data[idx]);
});

export default router;
