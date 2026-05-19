import { Router } from 'express';
import { readJSONAsync, writeJSONAtomic, withDataLock, generateId, sanitize, isActive } from '../utils.js';
import { requireAuth, requireAdmin } from '../auth.js';
import { sendToAll, fireAndForget } from '../push.js';

const router = Router();
const FILE = 'news.json';

router.get('/', requireAuth, async (_req, res) => {
  const data = await readJSONAsync(FILE);
  res.json(data.filter(isActive).sort((a, b) => (b.datum || '').localeCompare(a.datum || '')));
});

router.get('/all', requireAuth, requireAdmin, async (_req, res) => {
  const data = await readJSONAsync(FILE);
  res.json(data.sort((a, b) => (b.datum || '').localeCompare(a.datum || '')));
});

router.get('/categories', requireAuth, async (_req, res) => {
  const data = await readJSONAsync(FILE);
  const cats = [...new Set(data.filter(isActive).map(n => n.category).filter(Boolean))];
  res.json(['Alle', ...cats.sort()]);
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const safe = sanitize(req.body);
  let item;
  await withDataLock(async () => {
    const data = await readJSONAsync(FILE);
    item = {
      id: generateId(),
      datum: safe.datum || new Date().toISOString().split('T')[0],
      category: safe.category || '',
      categoryColor: safe.categoryColor || '#5A616B',
      title: safe.title || '',
      teaser: safe.teaser || '',
      detail: safe.detail || '',
      linkTo: safe.linkTo || null,
      isNew: safe.isNew || false,
      aktiv: safe.aktiv !== false,
      gueltigBis: safe.gueltigBis || null,
      erstellt: new Date().toISOString(),
    };
    data.push(item);
    await writeJSONAtomic(FILE, data);
  });

  if (item.aktiv !== false) {
    fireAndForget(sendToAll({
      title: item.title || 'Neue News',
      body: item.teaser || '',
      url: '/',
      tag: `news-${item.id}`,
    }));
  }

  res.status(201).json(item);
});

router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const allowed = ['datum', 'category', 'categoryColor', 'title', 'teaser', 'detail', 'linkTo', 'isNew', 'aktiv', 'gueltigBis'];
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
