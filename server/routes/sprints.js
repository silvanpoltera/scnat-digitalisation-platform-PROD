import { Router } from 'express';
import { readJSON, writeJSON, generateId, sanitize } from '../utils.js';
import { requireAuth, requireAdmin } from '../auth.js';

const router = Router();
const FILE = 'sprints.json';

function enrichMassnahmen(sprint) {
  const allMassnahmen = readJSON('massnahmen.json');
  return {
    ...sprint,
    massnahmen: sprint.massnahmen.map(sm => {
      const full = allMassnahmen.find(m => m.id === sm.massnahmeId);
      return {
        ...sm,
        titel: full?.titel || sm.massnahmeId,
        cluster: full?.cluster || '',
        wirkung: full?.wirkung || 0,
        aufwand: full?.aufwand || 0,
      };
    }),
  };
}

router.get('/', requireAuth, (req, res) => {
  let sprints = readJSON(FILE).filter(s => s.status !== 'archived');
  if (req.user?.role !== 'admin') sprints = sprints.filter(s => !s.isAdminSprint);
  const allMassnahmen = readJSON('massnahmen.json');
  const enriched = sprints.map(s => ({
    ...s,
    massnahmen: s.massnahmen.map(sm => {
      const full = allMassnahmen.find(m => m.id === sm.massnahmeId);
      return { ...sm, titel: full?.titel || sm.massnahmeId };
    }),
  }));
  res.json(enriched);
});

router.get('/:id', requireAuth, (req, res) => {
  const sprints = readJSON(FILE);
  const sprint = sprints.find(s => s.id === req.params.id);
  if (!sprint) return res.status(404).json({ error: 'Sprint nicht gefunden' });
  if (sprint.isAdminSprint && req.user?.role !== 'admin') {
    return res.status(404).json({ error: 'Sprint nicht gefunden' });
  }
  res.json(enrichMassnahmen(sprint));
});

router.post('/', requireAuth, requireAdmin, (req, res) => {
  const sprints = readJSON(FILE);
  const safe = sanitize(req.body);
  if (!safe.name) return res.status(400).json({ error: 'Name erforderlich' });

  const newSprint = {
    id: 'sprint-' + generateId(),
    name: safe.name,
    cluster: safe.cluster || 'infrastruktur',
    clusterColor: safe.clusterColor || '#0098DA',
    description: safe.description || '',
    startDate: safe.startDate || '',
    endDate: safe.endDate || '',
    status: safe.status || 'planned',
    massnahmen: Array.isArray(safe.massnahmen) ? safe.massnahmen : [],
    isAdminSprint: !!safe.isAdminSprint,
  };

  sprints.push(newSprint);
  writeJSON(FILE, sprints);
  res.status(201).json(newSprint);
});

router.put('/:id', requireAuth, requireAdmin, (req, res) => {
  const sprints = readJSON(FILE);
  const idx = sprints.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Sprint nicht gefunden' });

  const safe = sanitize(req.body);
  const allowed = ['name', 'cluster', 'clusterColor', 'description', 'startDate', 'endDate', 'status', 'massnahmen', 'isAdminSprint'];
  allowed.forEach(key => {
    if (safe[key] !== undefined) sprints[idx][key] = safe[key];
  });

  writeJSON(FILE, sprints);
  res.json(enrichMassnahmen(sprints[idx]));
});

export default router;
