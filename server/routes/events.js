import { Router } from 'express';
import { readJSON, writeJSON, generateId } from '../utils.js';
import { requireAuth, requireAdmin } from '../auth.js';

const router = Router();
const FILE = 'events.json';

router.get('/', requireAuth, (_req, res) => {
  res.json(readJSON(FILE));
});

router.put('/', requireAuth, requireAdmin, (req, res) => {
  const data = readJSON(FILE);
  const newItem = { id: generateId(), ...req.body, anmeldungen: [] };
  data.push(newItem);
  writeJSON(FILE, data);
  res.status(201).json(newItem);
});

router.delete('/:id', requireAuth, requireAdmin, (req, res) => {
  let data = readJSON(FILE);
  data = data.filter(e => e.id !== req.params.id);
  writeJSON(FILE, data);
  res.json({ ok: true });
});

export default router;
