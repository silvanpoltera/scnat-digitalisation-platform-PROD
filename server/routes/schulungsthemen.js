import { Router } from 'express';
import { readJSON, writeJSON, generateId, sanitize } from '../utils.js';
import { requireAuth, requireAdmin } from '../auth.js';

const router = Router();
const FILE = 'schulungsthemen.json';

const ALLOWED_STATUS = ['offen', 'geplant', 'in-umsetzung', 'erledigt', 'abgelehnt'];

router.get('/', requireAuth, (req, res) => {
  const data = readJSON(FILE);
  data.sort((a, b) => {
    if (a.typ === 'vordefiniert' && b.typ !== 'vordefiniert') return -1;
    if (b.typ === 'vordefiniert' && a.typ !== 'vordefiniert') return 1;
    return (b.likes?.length || 0) - (a.likes?.length || 0);
  });

  // Admins sehen Submitter-Kontakt (Name + Mail) für User-Vorschläge — damit sie Rücksprache halten können.
  if (req.user?.role === 'admin') {
    const users = readJSON('users.json');
    const enriched = data.map(t => {
      if (t.typ === 'vordefiniert' || !t.erstelltVon) return t;
      const u = users.find(x => x.id === t.erstelltVon);
      if (!u) return t;
      return { ...t, ersteller: { id: u.id, name: u.name, email: u.email } };
    });
    return res.json(enriched);
  }

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

router.patch('/:id', requireAuth, requireAdmin, (req, res) => {
  const data = readJSON(FILE);
  const item = data.find(t => t.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Nicht gefunden' });

  const { status, adminAntwort, titel, beschreibung, linkedEventId } = sanitize(req.body);

  if (titel !== undefined) {
    const t = String(titel).trim();
    if (!t) return res.status(400).json({ error: 'Titel darf nicht leer sein' });
    item.titel = t;
  }
  if (beschreibung !== undefined) {
    item.beschreibung = beschreibung ? String(beschreibung).trim() : '';
  }
  if (status !== undefined) {
    if (status !== '' && !ALLOWED_STATUS.includes(status)) {
      return res.status(400).json({ error: 'Ungültiger Status' });
    }
    item.status = status || null;
  }
  if (adminAntwort !== undefined) {
    item.adminAntwort = adminAntwort ? String(adminAntwort).trim() : '';
  }
  if (linkedEventId !== undefined) {
    item.linkedEventId = linkedEventId || null;
  }
  item.adminUpdatedAt = new Date().toISOString();
  item.adminUpdatedBy = req.user.name || 'Admin';

  writeJSON(FILE, data);
  res.json(item);
});

router.delete('/:id', requireAuth, (req, res) => {
  const data = readJSON(FILE);
  const item = data.find(t => t.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Nicht gefunden' });

  // Admins dürfen alles löschen (auch vordefinierte). Andere User nur eigene Vorschläge.
  const isAdmin = req.user.role === 'admin';
  if (!isAdmin) {
    if (item.typ === 'vordefiniert') return res.status(403).json({ error: 'Nur Admins können vordefinierte Themen löschen' });
    if (item.erstelltVon !== req.user.id) return res.status(403).json({ error: 'Nur als Ersteller oder Admin löschbar' });
  }

  const filtered = data.filter(t => t.id !== req.params.id);
  writeJSON(FILE, filtered);
  res.json({ ok: true });
});

export default router;
