import { Router } from 'express';
import { readJSONAsync, writeJSONAtomic, withDataLock } from '../utils.js';
import { requireAuth } from '../auth.js';

const router = Router();
const FILE = 'software-votes.json';

router.get('/', requireAuth, async (req, res) => {
  const votes = await readJSONAsync(FILE);
  const safe = votes.map(({ userId, ...v }) => ({
    ...v,
    isOwn: userId === req.user.id,
  }));
  res.json(safe);
});

router.get('/ranking', requireAuth, async (_req, res) => {
  const votes = await readJSONAsync(FILE);
  const grouped = {};

  votes.forEach(v => {
    if (!grouped[v.softwareId]) grouped[v.softwareId] = { up: 0, down: 0, interest: 0, total: 0 };
    if (v.type === 'up') { grouped[v.softwareId].up++; grouped[v.softwareId].total++; }
    else if (v.type === 'down') { grouped[v.softwareId].down++; grouped[v.softwareId].total++; }
    else if (v.type === 'interest') { grouped[v.softwareId].interest++; }
  });

  const ranking = Object.entries(grouped).map(([id, counts]) => ({
    softwareId: id,
    ...counts,
    satisfaction: counts.total > 0 ? Math.round((counts.up / counts.total) * 100) : null,
  }));

  res.json(ranking);
});

router.post('/', requireAuth, async (req, res) => {
  const { softwareId, type } = req.body;
  if (!softwareId || !['up', 'down', 'interest'].includes(type)) {
    return res.status(400).json({ error: 'softwareId und type (up/down/interest) erforderlich' });
  }

  await withDataLock(async () => {
    const data = await readJSONAsync(FILE);
    const existingIdx = data.findIndex(v => v.softwareId === softwareId && v.userId === req.user.id);

    if (existingIdx >= 0) {
      data[existingIdx].type = type;
      data[existingIdx].timestamp = new Date().toISOString();
    } else {
      data.push({ softwareId, userId: req.user.id, type, timestamp: new Date().toISOString() });
    }

    await writeJSONAtomic(FILE, data);
  });
  res.json({ ok: true });
});

router.delete('/', requireAuth, async (req, res) => {
  const { softwareId } = req.body;
  if (!softwareId) return res.status(400).json({ error: 'softwareId erforderlich' });
  await withDataLock(async () => {
    let data = await readJSONAsync(FILE);
    data = data.filter(v => !(v.softwareId === softwareId && v.userId === req.user.id));
    await writeJSONAtomic(FILE, data);
  });
  res.json({ ok: true });
});

export default router;
