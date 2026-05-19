import { Router } from 'express';
import { readJSONAsync, writeJSONAtomic, withDataLock, generateId, sanitize } from '../utils.js';
import { requireAuth, requireAdmin } from '../auth.js';

const router = Router();
const FILE = 'events.json';

router.get('/', requireAuth, async (_req, res) => {
  res.json(await readJSONAsync(FILE));
});

router.put('/', requireAuth, requireAdmin, async (req, res) => {
  const { titel, datum, zeit, ort, beschreibung, maxTeilnehmer, kategorie } = sanitize(req.body);
  if (!titel || !datum) return res.status(400).json({ error: 'Titel und Datum erforderlich' });
  let newItem;
  await withDataLock(async () => {
    const data = await readJSONAsync(FILE);
    newItem = { id: generateId(), titel, datum, zeit, ort, beschreibung, maxTeilnehmer, kategorie, anmeldungen: [] };
    data.push(newItem);
    await writeJSONAtomic(FILE, data);
  });
  res.status(201).json(newItem);
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  await withDataLock(async () => {
    let data = await readJSONAsync(FILE);
    data = data.filter(e => e.id !== req.params.id);
    await writeJSONAtomic(FILE, data);
  });
  res.json({ ok: true });
});

export default router;
