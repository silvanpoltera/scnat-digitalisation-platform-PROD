import { Router } from 'express';
import { readJSONAsync, writeJSONAtomic, withDataLock, generateId, sanitize, isActive } from '../utils.js';
import { requireAuth, requireAdmin } from '../auth.js';
import { sendToAll, fireAndForget } from '../push.js';

const router = Router();
const FILE = 'live-infos.json';

router.get('/', requireAuth, async (_req, res) => {
  const data = await readJSONAsync(FILE);
  res.json(data.filter(isActive));
});

router.get('/all', requireAuth, requireAdmin, async (_req, res) => {
  res.json(await readJSONAsync(FILE));
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const safe = sanitize(req.body);
  let item;
  await withDataLock(async () => {
    const data = await readJSONAsync(FILE);
    item = {
      id: generateId(),
      tag: safe.tag || '',
      text: safe.text || '',
      priority: safe.priority || 'normal',
      aktiv: safe.aktiv !== false,
      gueltigBis: safe.gueltigBis || null,
      erstellt: new Date().toISOString(),
    };
    data.push(item);
    await writeJSONAtomic(FILE, data);
  });

  if (item.aktiv !== false && (item.priority === 'important' || item.priority === 'high')) {
    fireAndForget(sendToAll({
      title: item.tag ? `Live-Info: ${item.tag}` : 'Neue Live-Info',
      body: item.text || '',
      url: '/',
      tag: `live-info-${item.id}`,
    }));
  }

  res.status(201).json(item);
});

router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const allowed = ['tag', 'text', 'priority', 'aktiv', 'gueltigBis'];
  const safe = sanitize(req.body);
  let updated;
  await withDataLock(async () => {
    const data = await readJSONAsync(FILE);
    const idx = data.findIndex(i => i.id === req.params.id);
    if (idx === -1) return;
    allowed.forEach(k => {
      if (safe[k] !== undefined) data[idx][k] = safe[k];
    });
    updated = data[idx];
    await writeJSONAtomic(FILE, data);
  });
  if (!updated) return res.status(404).json({ error: 'Nicht gefunden' });
  res.json(updated);
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  await withDataLock(async () => {
    let data = await readJSONAsync(FILE);
    data = data.filter(i => i.id !== req.params.id);
    await writeJSONAtomic(FILE, data);
  });
  res.json({ ok: true });
});

export default router;
