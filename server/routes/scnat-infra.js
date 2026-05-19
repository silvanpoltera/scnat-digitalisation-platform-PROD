import { Router } from 'express';
import { readJSONAsync, writeJSONAtomic, withDataLock, generateId, pick, sanitize } from '../utils.js';
import { requireAuth, requireAdmin } from '../auth.js';

const router = Router();
const FILE = 'scnat-infra.json';

async function getData() {
  const raw = await readJSONAsync(FILE);
  if (Array.isArray(raw)) return { status: {}, entscheide: [], backlog: [] };
  return raw;
}

router.get('/', requireAuth, async (_req, res) => {
  res.json(await getData());
});

const STATUS_KEYS = ['konsolidierung', 'migration', 'timeline', 'phase', 'fortschritt', 'notiz'];

router.post('/status', requireAuth, requireAdmin, async (req, res) => {
  let updated;
  await withDataLock(async () => {
    const data = await getData();
    const updates = pick(sanitize(req.body), STATUS_KEYS);
    Object.assign(data.status, updates);
    await writeJSONAtomic(FILE, data);
    updated = data;
  });
  res.json(updated);
});

const ENTSCHEID_KEYS = ['titel', 'beschreibung', 'status', 'prioritaet', 'notiz', 'deadline', 'entscheidung'];

router.post('/entscheide/:id', requireAuth, requireAdmin, async (req, res) => {
  let updated;
  await withDataLock(async () => {
    const data = await getData();
    const idx = data.entscheide.findIndex(e => e.id === req.params.id);
    if (idx === -1) return;
    const updates = pick(sanitize(req.body), ENTSCHEID_KEYS);
    Object.assign(data.entscheide[idx], updates);
    await writeJSONAtomic(FILE, data);
    updated = data.entscheide[idx];
  });
  if (!updated) return res.status(404).json({ error: 'Nicht gefunden' });
  res.json(updated);
});

router.put('/backlog', requireAuth, requireAdmin, async (req, res) => {
  const { titel, beschreibung, kategorie, prioritaet } = sanitize(req.body);
  if (!titel) return res.status(400).json({ error: 'Titel erforderlich' });
  let newItem;
  await withDataLock(async () => {
    const data = await getData();
    newItem = { id: generateId(), titel, beschreibung, kategorie, prioritaet, status: 'offen' };
    data.backlog.push(newItem);
    await writeJSONAtomic(FILE, data);
  });
  res.status(201).json(newItem);
});

const BACKLOG_KEYS = ['titel', 'beschreibung', 'kategorie', 'prioritaet', 'status'];

router.post('/backlog/:id', requireAuth, requireAdmin, async (req, res) => {
  let updated;
  await withDataLock(async () => {
    const data = await getData();
    const idx = data.backlog.findIndex(b => b.id === req.params.id);
    if (idx === -1) return;
    const updates = pick(sanitize(req.body), BACKLOG_KEYS);
    Object.assign(data.backlog[idx], updates);
    await writeJSONAtomic(FILE, data);
    updated = data.backlog[idx];
  });
  if (!updated) return res.status(404).json({ error: 'Nicht gefunden' });
  res.json(updated);
});

router.delete('/backlog/:id', requireAuth, requireAdmin, async (req, res) => {
  await withDataLock(async () => {
    const data = await getData();
    data.backlog = data.backlog.filter(b => b.id !== req.params.id);
    await writeJSONAtomic(FILE, data);
  });
  res.json({ ok: true });
});

export default router;
