import { Router } from 'express';
import { readJSON, writeJSON, generateId, sanitize } from '../utils.js';
import { requireAuth, requireAdmin } from '../auth.js';

const router = Router();
const FILE = 'news.json';

function isActive(item) {
  if (!item.aktiv) return false;
  if (item.gueltigBis) {
    const now = new Date().toISOString().split('T')[0];
    if (item.gueltigBis < now) return false;
  }
  return true;
}

router.get('/', requireAuth, (_req, res) => {
  const data = readJSON(FILE);
  res.json(data.filter(isActive).sort((a, b) => (b.datum || '').localeCompare(a.datum || '')));
});

router.get('/all', requireAuth, requireAdmin, (_req, res) => {
  const data = readJSON(FILE);
  res.json(data.sort((a, b) => (b.datum || '').localeCompare(a.datum || '')));
});

router.get('/categories', requireAuth, (_req, res) => {
  const data = readJSON(FILE);
  const cats = [...new Set(data.filter(isActive).map(n => n.category).filter(Boolean))];
  res.json(['Alle', ...cats.sort()]);
});

router.post('/', requireAuth, requireAdmin, (req, res) => {
  const data = readJSON(FILE);
  const safe = sanitize(req.body);
  const item = {
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
  writeJSON(FILE, data);
  res.status(201).json(item);
});

router.put('/:id', requireAuth, requireAdmin, (req, res) => {
  const data = readJSON(FILE);
  const idx = data.findIndex(i => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Nicht gefunden' });

  const allowed = ['datum', 'category', 'categoryColor', 'title', 'teaser', 'detail', 'linkTo', 'isNew', 'aktiv', 'gueltigBis'];
  const safe = sanitize(req.body);
  allowed.forEach(k => {
    if (safe[k] !== undefined) data[idx][k] = safe[k];
  });
  writeJSON(FILE, data);
  res.json(data[idx]);
});

router.delete('/:id', requireAuth, requireAdmin, (req, res) => {
  let data = readJSON(FILE);
  data = data.filter(i => i.id !== req.params.id);
  writeJSON(FILE, data);
  res.json({ ok: true });
});

export default router;
