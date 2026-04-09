import { Router } from 'express';
import { readJSON, writeJSON } from '../utils.js';
import { requireAuth } from '../auth.js';

const router = Router();
const SEEN_FILE = 'notifications-seen.json';

function getSeenMap() {
  const data = readJSON(SEEN_FILE);
  return Array.isArray(data) ? {} : (data || {});
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
  count += myRequests.filter(r =>
    (r.antwortTimestamp && r.antwortTimestamp > lastSeen)
  ).length;

  const changes = readJSON('changes.json');
  const myChanges = changes.filter(c =>
    c.userId === userId || (c.kontaktEmail || '').toLowerCase().trim() === userEmail
  );
  count += myChanges.filter(c =>
    (c.antwortTimestamp && c.antwortTimestamp > lastSeen)
  ).length;

  res.json({ count });
});

router.post('/seen', requireAuth, (req, res) => {
  const userId = req.user.id;
  const seenMap = getSeenMap();
  seenMap[userId] = new Date().toISOString();
  writeJSON(SEEN_FILE, seenMap);
  res.json({ ok: true });
});

export default router;
