import { Router } from 'express';
import { readJSON, writeJSON, sanitize } from '../utils.js';
import { requireAuth, requireAdmin } from '../auth.js';

export default function createContentRouter(filename) {
  const router = Router();

  router.get('/', requireAuth, (_req, res) => {
    const data = readJSON(filename);
    res.json(Array.isArray(data) ? {} : data);
  });

  router.post('/', requireAuth, requireAdmin, (req, res) => {
    if (typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({ error: 'Body muss ein Objekt sein' });
    }
    writeJSON(filename, sanitize(req.body));
    res.json({ ok: true });
  });

  return router;
}
