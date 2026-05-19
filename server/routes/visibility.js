import { Router } from 'express';
import { readJSONAsync, writeJSONAtomic, withDataLock } from '../utils.js';
import { requireAuth, requireAdmin } from '../auth.js';

const router = Router();
const FILE = 'visibility.json';

const DEFAULT_PORTAL = [
  'home', 'strategie', 'handlungsfelder', 'massnahmen', 'sprints',
  'systemlandschaft', 'ki-hub', 'schulungen', 'software-antraege',
  'prozesse', 'team', 'faqs', 'glossar',
];

const DEFAULT_CP = [
  'cp-dashboard', 'cp-live-infos', 'cp-news', 'cp-nachrichten',
  'cp-content', 'cp-echo-addons', 'cp-events', 'cp-antraege', 'cp-users', 'cp-changes',
  'cp-massnahmen', 'cp-sprints', 'cp-themen', 'cp-scnat-db',
  'cp-sichtbarkeit', 'cp-admin-stuff', 'cp-admin-details',
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

function ensureDefaults(data) {
  // Selbstheilung: fehlende Default-Keys werden automatisch (sichtbar) angefügt,
  // damit neu in DEFAULT_PORTAL/DEFAULT_CP definierte Sektionen nicht aus Versehen verschluckt werden.
  const portalKeys = new Set(data.portal.map(s => s.key));
  const cpKeys = new Set(data.cp.map(s => s.key));
  for (const key of DEFAULT_PORTAL) {
    if (!portalKeys.has(key)) data.portal.push({ key, visible: true });
  }
  for (const key of DEFAULT_CP) {
    if (!cpKeys.has(key)) data.cp.push({ key, visible: true });
  }
  return data;
}

router.get('/', async (_req, res) => {
  const raw = await readJSONAsync(FILE);
  res.json(ensureDefaults(migrate(raw)));
});

router.put('/', requireAuth, requireAdmin, async (req, res) => {
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

  await withDataLock(async () => {
    await writeJSONAtomic(FILE, sanitized);
  });
  res.json({ ok: true });
});

export default router;
