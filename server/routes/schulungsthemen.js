import { Router } from 'express';
import { readJSON, writeJSON, generateId, sanitize } from '../utils.js';
import { requireAuth, requireAdmin } from '../auth.js';

const router = Router();
const FILE = 'schulungsthemen.json';

router.get('/', requireAuth, (_req, res) => {
  const data = readJSON(FILE);
  data.sort((a, b) => {
    if (a.typ === 'vordefiniert' && b.typ !== 'vordefiniert') return -1;
    if (b.typ === 'vordefiniert' && a.typ !== 'vordefiniert') return 1;
    return (b.likes?.length || 0) - (a.likes?.length || 0);
  });
  res.json(data);
});

router.post('/', requireAuth, (req, res) => {
  const { titel, beschreibung } = sanitize(req.body);
  if (!titel) return res.status(400).json({ error: 'Titel erforderlich' });

  const data = readJSON(FILE);
  const newItem = {
    id: generateId(),
    titel,
    beschreibung: beschreibung || '',
    typ: 'user-vorschlag',
    likes: [],
    erstellt: new Date().toISOString(),
    erstelltVon: req.user.id,
  };
  data.push(newItem);
  writeJSON(FILE, data);
  res.status(201).json(newItem);
});

router.post('/:id/like', requireAuth, (req, res) => {
  const data = readJSON(FILE);
  const item = data.find(t => t.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Nicht gefunden' });

  if (!item.likes) item.likes = [];
  const idx = item.likes.indexOf(req.user.id);
  if (idx >= 0) item.likes.splice(idx, 1);
  else item.likes.push(req.user.id);

  writeJSON(FILE, data);
  res.json(item);
});

router.delete('/:id', requireAuth, (req, res) => {
  const data = readJSON(FILE);
  const item = data.find(t => t.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Nicht gefunden' });
  if (item.typ === 'vordefiniert') return res.status(400).json({ error: 'Vordefinierte Themen nicht löschbar' });
  if ((item.likes?.length || 0) > 0 && item.erstelltVon !== req.user.id && req.user.role !== 'admin') {
    return res.status(400).json({ error: 'Nur löschbar bei 0 Likes oder als Ersteller/Admin' });
  }

  const filtered = data.filter(t => t.id !== req.params.id);
  writeJSON(FILE, filtered);
  res.json({ ok: true });
});

export default router;
