import { Router } from 'express';
import { readJSON, writeJSON } from '../utils.js';
import { requireAuth, requireAdmin } from '../auth.js';

const router = Router();
const FILE = 'visibility.json';

const DEFAULT_PORTAL = [
  'home', 'strategie', 'handlungsfelder', 'massnahmen', 'sprints',
  'systemlandschaft', 'ki-hub', 'schulungen', 'software-antraege',
  'scnat-db', 'meine-uebersicht', 'prozesse', 'team', 'faqs', 'glossar',
];

const DEFAULT_CP = [
  'cp-dashboard', 'cp-live-infos', 'cp-news', 'cp-nachrichten',
  'cp-content', 'cp-events', 'cp-antraege', 'cp-users', 'cp-changes',
  'cp-massnahmen', 'cp-sprints', 'cp-themen', 'cp-scnat-db',
  'cp-sichtbarkeit', 'cp-admin-stuff',
];

const ALL_VALID_KEYS = new Set([...DEFAULT_PORTAL, ...DEFAULT_CP]);

function migrate(data) {
  if (data && Array.isArray(data.portal) && Array.isArray(data.cp)) return data;

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return {
      portal: DEFAULT_PORTAL.map(key => ({ key, visible: data[key] !== false })),
      cp: DEFAULT_CP.map(key => ({ key, visible: data[key] !== false })),
    };
  }

  return {
    portal: DEFAULT_PORTAL.map(key => ({ key, visible: true })),
    cp: DEFAULT_CP.map(key => ({ key, visible: true })),
  };
}

function sanitizeGroup(items) {
  if (!Array.isArray(items)) return [];
  return items
    .filter(item => item && typeof item === 'object' && ALL_VALID_KEYS.has(item.key))
    .map(item => ({ key: String(item.key), visible: item.visible === true }));
}

router.get('/', (_req, res) => {
  const raw = readJSON(FILE);
  res.json(migrate(raw));
});

router.put('/', requireAuth, requireAdmin, (req, res) => {
  const { portal, cp } = req.body || {};

  if (!Array.isArray(portal) || !Array.isArray(cp)) {
    return res.status(400).json({ error: 'Body muss portal und cp Arrays enthalten' });
  }

  const sanitized = {
    portal: sanitizeGroup(portal),
    cp: sanitizeGroup(cp),
  };

  const usedKeys = new Set([...sanitized.portal.map(s => s.key), ...sanitized.cp.map(s => s.key)]);
  for (const key of ALL_VALID_KEYS) {
    if (!usedKeys.has(key)) {
      const isCP = key.startsWith('cp-');
      (isCP ? sanitized.cp : sanitized.portal).push({ key, visible: true });
    }
  }

  writeJSON(FILE, sanitized);
  res.json({ ok: true });
});

export default router;
