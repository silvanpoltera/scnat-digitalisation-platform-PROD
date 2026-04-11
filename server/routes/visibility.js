import { Router } from 'express';
import { readJSON, writeJSON } from '../utils.js';
import { requireAuth, requireAdmin } from '../auth.js';

const router = Router();
const FILE = 'visibility.json';

const VALID_KEYS = [
  'home', 'strategie', 'handlungsfelder', 'massnahmen',
  'systemlandschaft', 'ki-hub', 'schulungen', 'software-antraege',
  'scnat-db', 'prozesse', 'team', 'faqs', 'glossar',
];

router.get('/', (_req, res) => {
  const data = readJSON(FILE);
  res.json(Array.isArray(data) ? {} : data);
});

router.put('/', requireAuth, requireAdmin, (req, res) => {
  if (typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ error: 'Body muss ein Objekt sein' });
  }

  const sanitized = {};
  for (const key of VALID_KEYS) {
    sanitized[key] = req.body[key] === true;
  }

  writeJSON(FILE, sanitized);
  res.json({ ok: true });
});

export default router;
