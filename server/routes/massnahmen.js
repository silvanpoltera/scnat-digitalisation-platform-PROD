import { Router } from 'express';
import { readJSON, writeJSON, generateId, sanitize } from '../utils.js';
import { requireAuth, requireAdmin } from '../auth.js';

const router = Router();
const FILE = 'massnahmen.json';

router.get('/', requireAuth, (req, res) => {
  const all = readJSON(FILE);
  if (req.user?.role === 'admin') return res.json(all);
  res.json(all.filter(m => !m.isAdminTask));
});

router.put('/', requireAuth, requireAdmin, (req, res) => {
  const data = readJSON(FILE);
  const safe = sanitize(req.body);
  if (!safe.titel) return res.status(400).json({ error: 'Titel erforderlich' });

  const existingIds = new Set(data.map(m => m.id));
  const prefix = safe.isAdminTask ? 'at' : 'm';
  let nextNum = data.filter(m => m.id.startsWith(prefix)).length + 1;
  let newId = `${prefix}${String(nextNum).padStart(2, '0')}`;
  while (existingIds.has(newId)) { nextNum++; newId = `${prefix}${String(nextNum).padStart(2, '0')}`; }

  const newItem = {
    id: newId,
    titel: safe.titel,
    beschreibung: safe.beschreibung || '',
    cluster: safe.cluster || '',
    status: safe.status || 'geplant',
    tags: safe.tags || [],
    wirkung: safe.wirkung || 0,
    aufwand: safe.aufwand || 0,
    prioritaet: safe.prioritaet || 'C',
    prioritaet_label: safe.prioritaet_label || '',
    start_empfohlen: safe.start_empfohlen || false,
    scnat_db: safe.scnat_db || false,
    scnat_portal: safe.scnat_portal || false,
    isAdminTask: !!safe.isAdminTask,
    comments: [],
  };
  data.push(newItem);
  writeJSON(FILE, data);
  res.status(201).json(newItem);
});

router.post('/reorder', requireAuth, requireAdmin, (req, res) => {
  const { order } = req.body;
  if (!Array.isArray(order)) return res.status(400).json({ error: 'order must be an array' });

  const data = readJSON(FILE);
  const orderedIds = new Set(order.map(o => o.id));

  data.forEach(m => {
    if (orderedIds.has(m.id)) {
      const entry = order.find(o => o.id === m.id);
      m.reihenfolge = entry.reihenfolge;
    } else {
      m.reihenfolge = null;
    }
  });

  writeJSON(FILE, data);
  res.json({ ok: true });
});

router.post('/:id', requireAuth, requireAdmin, (req, res) => {
  const data = readJSON(FILE);
  const idx = data.findIndex(m => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Nicht gefunden' });

  const oldStatus = data[idx].status;

  const allowed = [
    'titel', 'beschreibung', 'cluster', 'status', 'notiz', 'tags',
    'wirkung', 'aufwand', 'prioritaet', 'prioritaet_label',
    'start_empfohlen', 'scnat_db', 'scnat_portal',
    'isNew', 'reihenfolge', 'isAdminTask', 'comments',
  ];
  const safe = sanitize(req.body);
  allowed.forEach(key => {
    if (safe[key] !== undefined) data[idx][key] = safe[key];
  });

  writeJSON(FILE, data);

  if (safe.status === 'abgeschlossen' && oldStatus !== 'abgeschlossen') {
    const changes = readJSON('changes.json');
    let changed = false;
    changes.forEach(c => {
      if (c.massnahmeId === req.params.id && c.status !== 'umgesetzt') {
        c.status = 'umgesetzt';
        changed = true;
      }
    });
    if (changed) writeJSON('changes.json', changes);
  }

  res.json(data[idx]);
});

router.delete('/:id', requireAuth, requireAdmin, (req, res) => {
  const data = readJSON(FILE);
  const idx = data.findIndex(m => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Nicht gefunden' });

  data.splice(idx, 1);
  writeJSON(FILE, data);

  const sprints = readJSON('sprints.json');
  let sprintsChanged = false;
  sprints.forEach(s => {
    const before = s.massnahmen.length;
    s.massnahmen = s.massnahmen.filter(m => m.massnahmeId !== req.params.id);
    if (s.massnahmen.length !== before) sprintsChanged = true;
  });
  if (sprintsChanged) writeJSON('sprints.json', sprints);

  res.json({ ok: true });
});

export default router;
