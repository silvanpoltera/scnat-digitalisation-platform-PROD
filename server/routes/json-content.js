import { Router } from 'express';
import { readJSONAsync, writeJSONAtomic, withDataLock, sanitize } from '../utils.js';
import { requireAuth, requireAdmin } from '../auth.js';

export default function createContentRouter(filename) {
  const router = Router();

  router.get('/', requireAuth, async (_req, res) => {
    const data = await readJSONAsync(filename);
    res.json(Array.isArray(data) ? {} : data);
  });

  router.post('/', requireAuth, requireAdmin, async (req, res) => {
    if (typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({ error: 'Body muss ein Objekt sein' });
    }
    await withDataLock(async () => {
      await writeJSONAtomic(filename, sanitize(req.body));
    });
    res.json({ ok: true });
  });

  return router;
}
