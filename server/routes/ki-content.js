import { Router } from 'express';
import { readJSON, writeJSON } from '../utils.js';
import { requireAuth, requireAdmin } from '../auth.js';

const router = Router();
const FILE = 'ki-content.json';

router.get('/', requireAuth, (_req, res) => {
  const data = readJSON(FILE);
  res.json(Array.isArray(data) ? {} : data);
});

router.post('/', requireAuth, requireAdmin, (req, res) => {
  writeJSON(FILE, req.body);
  res.json({ ok: true });
});

export default router;
