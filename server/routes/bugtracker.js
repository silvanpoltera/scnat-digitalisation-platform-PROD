import { Router } from 'express';
import { readJSON, writeJSON, sanitize } from '../utils.js';
import { requireAuth, requireAdmin } from '../auth.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = Router();
const FILE = 'bugtracker.json';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEED_PATH = path.join(__dirname, '..', 'seed', 'bugtracker-seed.json');

function readSeed() {
  try {
    if (!fs.existsSync(SEED_PATH)) return [];
    const raw = JSON.parse(fs.readFileSync(SEED_PATH, 'utf-8'));
    return Array.isArray(raw?.tickets) ? raw.tickets : [];
  } catch {
    return [];
  }
}

function getData() {
  const raw = readJSON(FILE);
  if (!raw || Array.isArray(raw)) {
    return { updated_at: new Date().toISOString(), tickets: readSeed() };
  }
  if (!Array.isArray(raw.tickets)) raw.tickets = [];
  if (raw.tickets.length === 0) raw.tickets = readSeed();
  return raw;
}

function saveData(data) {
  data.updated_at = new Date().toISOString();
  writeJSON(FILE, data);
}

router.get('/', requireAuth, (_req, res) => {
  res.json(getData());
});

router.post('/ticket/:id/status', requireAuth, requireAdmin, (req, res) => {
  const { status } = sanitize(req.body);
  if (!status) return res.status(400).json({ error: 'Status erforderlich' });

  const data = getData();
  const t = data.tickets.find(x => String(x.id) === String(req.params.id));
  if (!t) return res.status(404).json({ error: 'Ticket nicht gefunden' });

  t.status = status;
  t.geschlossen = false;
  t.geschlossen_grund = null;
  t.geschlossen_am = null;
  saveData(data);
  res.json(t);
});

router.post('/ticket/:id/close', requireAuth, requireAdmin, (req, res) => {
  const { grund } = sanitize(req.body);
  const data = getData();
  const t = data.tickets.find(x => String(x.id) === String(req.params.id));
  if (!t) return res.status(404).json({ error: 'Ticket nicht gefunden' });

  t.geschlossen = true;
  t.status = 'Geschlossen';
  t.geschlossen_grund = grund || null;
  t.geschlossen_am = new Date().toISOString();
  saveData(data);
  res.json(t);
});

router.post('/ticket/:id/reopen', requireAuth, requireAdmin, (req, res) => {
  const { status } = sanitize(req.body);
  const data = getData();
  const t = data.tickets.find(x => String(x.id) === String(req.params.id));
  if (!t) return res.status(404).json({ error: 'Ticket nicht gefunden' });

  t.geschlossen = false;
  t.status = status || 'Neu';
  t.geschlossen_grund = null;
  t.geschlossen_am = null;
  saveData(data);
  res.json(t);
});

router.post('/ticket/:id/notiz', requireAuth, requireAdmin, (req, res) => {
  const { notiz } = sanitize(req.body);
  const data = getData();
  const t = data.tickets.find(x => String(x.id) === String(req.params.id));
  if (!t) return res.status(404).json({ error: 'Ticket nicht gefunden' });

  t.notiz = notiz || '';
  saveData(data);
  res.json(t);
});

router.post('/bulk/close', requireAuth, requireAdmin, (req, res) => {
  const body = sanitize(req.body);
  const ids = Array.isArray(body.ids) ? body.ids.map(String) : [];
  if (!ids.length) return res.status(400).json({ error: 'IDs erforderlich' });
  const grund = body.grund || null;

  const data = getData();
  let changed = 0;
  for (const t of data.tickets) {
    if (!ids.includes(String(t.id))) continue;
    t.geschlossen = true;
    t.status = 'Geschlossen';
    t.geschlossen_grund = grund;
    t.geschlossen_am = new Date().toISOString();
    changed += 1;
  }
  saveData(data);
  res.json({ ok: true, changed });
});

router.post('/bulk/reopen', requireAuth, requireAdmin, (req, res) => {
  const body = sanitize(req.body);
  const ids = Array.isArray(body.ids) ? body.ids.map(String) : [];
  if (!ids.length) return res.status(400).json({ error: 'IDs erforderlich' });
  const status = body.status || 'Neu';

  const data = getData();
  let changed = 0;
  for (const t of data.tickets) {
    if (!ids.includes(String(t.id))) continue;
    t.geschlossen = false;
    t.status = status;
    t.geschlossen_grund = null;
    t.geschlossen_am = null;
    changed += 1;
  }
  saveData(data);
  res.json({ ok: true, changed });
});

export default router;
