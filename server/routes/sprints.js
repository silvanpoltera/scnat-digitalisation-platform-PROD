import { Router } from 'express';
import { readJSONAsync, writeJSONAtomic, withDataLock, generateId, sanitize } from '../utils.js';
import { requireAuth, requireAdmin } from '../auth.js';

const router = Router();
const FILE = 'sprints.json';

async function enrichMassnahmen(sprint) {
  const allMassnahmen = await readJSONAsync('massnahmen.json');
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

router.get('/', requireAuth, async (req, res) => {
  let sprints = await readJSONAsync(FILE);
  const showArchived = req.user?.role === 'admin' && req.query.includeArchived === 'true';
  if (!showArchived) sprints = sprints.filter(s => s.status !== 'archived');
  if (req.user?.role !== 'admin') sprints = sprints.filter(s => !s.isAdminSprint);
  const allMassnahmen = await readJSONAsync('massnahmen.json');
  const enriched = sprints.map(s => ({
    ...s,
    massnahmen: s.massnahmen.map(sm => {
      const full = allMassnahmen.find(m => m.id === sm.massnahmeId);
      return { ...sm, titel: full?.titel || sm.massnahmeId };
    }),
  }));
  res.json(enriched);
});

router.get('/:id', requireAuth, async (req, res) => {
  const sprints = await readJSONAsync(FILE);
  const sprint = sprints.find(s => s.id === req.params.id);
  if (!sprint) return res.status(404).json({ error: 'Sprint nicht gefunden' });
  if (sprint.isAdminSprint && req.user?.role !== 'admin') {
    return res.status(404).json({ error: 'Sprint nicht gefunden' });
  }
  res.json(await enrichMassnahmen(sprint));
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const safe = sanitize(req.body);
  if (!safe.name) return res.status(400).json({ error: 'Name erforderlich' });

  let newSprint;
  await withDataLock(async () => {
    const sprints = await readJSONAsync(FILE);
    newSprint = {
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
    await writeJSONAtomic(FILE, sprints);
  });
  res.status(201).json(newSprint);
});

router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const safe = sanitize(req.body);
  const allowed = ['name', 'cluster', 'clusterColor', 'description', 'startDate', 'endDate', 'status', 'massnahmen', 'isAdminSprint'];
  let updated;
  await withDataLock(async () => {
    const sprints = await readJSONAsync(FILE);
    const idx = sprints.findIndex(s => s.id === req.params.id);
    if (idx === -1) return;
    allowed.forEach(key => {
      if (safe[key] !== undefined) sprints[idx][key] = safe[key];
    });
    updated = sprints[idx];
    await writeJSONAtomic(FILE, sprints);
  });
  if (!updated) return res.status(404).json({ error: 'Sprint nicht gefunden' });
  res.json(await enrichMassnahmen(updated));
});

export default router;
