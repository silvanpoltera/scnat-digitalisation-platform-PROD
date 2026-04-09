import { Router } from 'express';
import { readJSON, writeJSON, generateId } from '../utils.js';
import { requireAuth, requireAdmin } from '../auth.js';

const router = Router();
const FILE = 'live-infos.json';

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
  res.json(data.filter(isActive));
});

router.get('/all', requireAuth, requireAdmin, (_req, res) => {
  res.json(readJSON(FILE));
});

router.post('/', requireAuth, requireAdmin, (req, res) => {
  const data = readJSON(FILE);
  const item = {
    id: generateId(),
    tag: req.body.tag || '',
    text: req.body.text || '',
    priority: req.body.priority || 'normal',
    aktiv: req.body.aktiv !== false,
    gueltigBis: req.body.gueltigBis || null,
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

  const allowed = ['tag', 'text', 'priority', 'aktiv', 'gueltigBis'];
  allowed.forEach(k => {
    if (req.body[k] !== undefined) data[idx][k] = req.body[k];
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
