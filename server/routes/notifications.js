import { Router } from 'express';
import { readJSON, writeJSON } from '../utils.js';
import { requireAuth } from '../auth.js';

const router = Router();
const SEEN_FILE = 'notifications-seen.json';

function getSeenMap() {
  const data = readJSON(SEEN_FILE);
  return Array.isArray(data) ? {} : (data || {});
}

function hasUpdate(item, lastSeen) {
  return (item.antwortTimestamp && item.antwortTimestamp > lastSeen) ||
         (item.statusUpdatedAt && item.statusUpdatedAt > lastSeen);
}

router.get('/count', requireAuth, (req, res) => {
  const userId = req.user.id;
  const userEmail = (req.user.email || '').toLowerCase().trim();
  const seenMap = getSeenMap();
  const lastSeen = seenMap[userId] || '1970-01-01T00:00:00.000Z';

  let count = 0;

  const requests = readJSON('requests.json');
  const myRequests = requests.filter(r =>
    r.userId === userId || (r.userEmail || '').toLowerCase().trim() === userEmail
  );
  count += myRequests.filter(r => hasUpdate(r, lastSeen)).length;

  const changes = readJSON('changes.json');
  const myChanges = changes.filter(c =>
    c.userId === userId || (c.kontaktEmail || '').toLowerCase().trim() === userEmail
  );
  count += myChanges.filter(c => hasUpdate(c, lastSeen)).length;

  res.json({ count });
});

router.post('/seen', requireAuth, (req, res) => {
  const userId = req.user.id;
  const seenMap = getSeenMap();
  seenMap[userId] = new Date().toISOString();
  writeJSON(SEEN_FILE, seenMap);
  res.json({ ok: true });
});

router.get('/admin', requireAuth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Kein Admin' });

  const seenMap = getSeenMap();
  const adminKey = `admin:${req.user.id}`;
  const seen = seenMap[adminKey] || {};
  const now = '1970-01-01T00:00:00.000Z';

  const requests = readJSON('requests.json');
  const changes = readJSON('changes.json');
  const regs = readJSON('registrations.json');
  const themen = readJSON('schulungsthemen.json');

  const counts = {
    antraege: requests.filter(r => (r.timestamp || '') > (seen.antraege || now)).length,
    changes: changes.filter(c => (c.timestamp || '') > (seen.changes || now)).length,
    events: regs.filter(r => (r.timestamp || '') > (seen.events || now)).length,
    themen: themen.filter(t => t.typ !== 'vordefiniert' && (t.erstellt || '') > (seen.themen || now)).length,
  };

  res.json(counts);
});

router.post('/admin/seen', requireAuth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Kein Admin' });

  const { section } = req.body;
  if (!section) return res.status(400).json({ error: 'section required' });

  const seenMap = getSeenMap();
  const adminKey = `admin:${req.user.id}`;
  if (!seenMap[adminKey]) seenMap[adminKey] = {};
  seenMap[adminKey][section] = new Date().toISOString();
  writeJSON(SEEN_FILE, seenMap);
  res.json({ ok: true });
});

export default router;
