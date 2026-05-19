import { Router } from 'express';
import { readJSONAsync, writeJSONAtomic, withDataLock, generateId, sanitize } from '../utils.js';
import { requireAuth, requireAdmin } from '../auth.js';
import { sendToAdmins, fireAndForget } from '../push.js';

const router = Router();
const FILE = 'schulungsthemen.json';

const ALLOWED_STATUS = ['offen', 'geplant', 'in-umsetzung', 'erledigt', 'abgelehnt'];

router.get('/', requireAuth, async (req, res) => {
  const data = await readJSONAsync(FILE);
  data.sort((a, b) => {
    if (a.typ === 'vordefiniert' && b.typ !== 'vordefiniert') return -1;
    if (b.typ === 'vordefiniert' && a.typ !== 'vordefiniert') return 1;
    return (b.likes?.length || 0) - (a.likes?.length || 0);
  });

  // Admins sehen Submitter-Kontakt (Name + Mail) für User-Vorschläge — damit sie Rücksprache halten können.
  if (req.user?.role === 'admin') {
    const users = await readJSONAsync('users.json');
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

router.post('/', requireAuth, async (req, res) => {
  const { titel, beschreibung } = sanitize(req.body);
  if (!titel) return res.status(400).json({ error: 'Titel erforderlich' });

  let newItem;
  await withDataLock(async () => {
    const data = await readJSONAsync(FILE);
    newItem = {
      id: generateId(),
      titel,
      beschreibung: beschreibung || '',
      typ: 'user-vorschlag',
      likes: [],
      erstellt: new Date().toISOString(),
      erstelltVon: req.user.id,
    };
    data.push(newItem);
    await writeJSONAtomic(FILE, data);
  });

  fireAndForget(sendToAdmins({
    title: 'Neuer Schulungs-Vorschlag',
    body: newItem.titel,
    url: '/cp/themen',
    tag: `themen-new-${newItem.id}`,
  }));

  res.status(201).json(newItem);
});

router.post('/:id/like', requireAuth, async (req, res) => {
  let item;
  await withDataLock(async () => {
    const data = await readJSONAsync(FILE);
    item = data.find(t => t.id === req.params.id);
    if (!item) return;

    if (!item.likes) item.likes = [];
    const idx = item.likes.indexOf(req.user.id);
    if (idx >= 0) item.likes.splice(idx, 1);
    else item.likes.push(req.user.id);

    await writeJSONAtomic(FILE, data);
  });
  if (!item) return res.status(404).json({ error: 'Nicht gefunden' });
  res.json(item);
});

router.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { status, adminAntwort, titel, beschreibung, linkedEventId } = sanitize(req.body);
  if (status !== undefined && status !== '' && !ALLOWED_STATUS.includes(status)) {
    return res.status(400).json({ error: 'Ungültiger Status' });
  }
  if (titel !== undefined) {
    const t = String(titel).trim();
    if (!t) return res.status(400).json({ error: 'Titel darf nicht leer sein' });
  }

  let item;
  await withDataLock(async () => {
    const data = await readJSONAsync(FILE);
    item = data.find(t => t.id === req.params.id);
    if (!item) return;

    if (titel !== undefined) {
      item.titel = String(titel).trim();
    }
    if (beschreibung !== undefined) {
      item.beschreibung = beschreibung ? String(beschreibung).trim() : '';
    }
    if (status !== undefined) {
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

    await writeJSONAtomic(FILE, data);
  });
  if (!item) return res.status(404).json({ error: 'Nicht gefunden' });
  res.json(item);
});

router.delete('/:id', requireAuth, async (req, res) => {
  let status = null;
  await withDataLock(async () => {
    const data = await readJSONAsync(FILE);
    const item = data.find(t => t.id === req.params.id);
    if (!item) {
      status = 'not_found';
      return;
    }

    const isAdmin = req.user.role === 'admin';
    if (!isAdmin) {
      if (item.typ === 'vordefiniert') {
        status = 'forbidden_predefined';
        return;
      }
      if (item.erstelltVon !== req.user.id) {
        status = 'forbidden_owner';
        return;
      }
    }

    const filtered = data.filter(t => t.id !== req.params.id);
    await writeJSONAtomic(FILE, filtered);
    status = 'ok';
  });
  if (status === 'not_found') return res.status(404).json({ error: 'Nicht gefunden' });
  if (status === 'forbidden_predefined') return res.status(403).json({ error: 'Nur Admins können vordefinierte Themen löschen' });
  if (status === 'forbidden_owner') return res.status(403).json({ error: 'Nur als Ersteller oder Admin löschbar' });
  res.json({ ok: true });
});

export default router;
