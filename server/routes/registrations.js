import { Router } from 'express';
import { readJSON, writeJSON, generateId } from '../utils.js';
import { requireAuth, requireAdmin } from '../auth.js';

const router = Router();

router.post('/', requireAuth, (req, res) => {
  const { eventId, name, email, abteilung } = req.body;
  if (!eventId || !name || !email) return res.status(400).json({ error: 'Felder fehlen' });

  const events = readJSON('events.json');
  const event = events.find(e => e.id === eventId);
  if (!event) return res.status(404).json({ error: 'Event nicht gefunden' });

  if (event.anmeldungen && event.anmeldungen.length >= event.maxTeilnehmer) {
    return res.status(400).json({ error: 'Ausgebucht' });
  }

  const regsExisting = readJSON('registrations.json');
  const normalEmail = email.toLowerCase().trim();
  const alreadyRegistered = regsExisting.some(r =>
    r.eventId === eventId && (r.userId === req.user.id || (r.email || '').toLowerCase().trim() === normalEmail)
  );
  if (alreadyRegistered) {
    return res.status(409).json({ error: 'Du bist bereits für dieses Event angemeldet.' });
  }

  const reg = {
    id: generateId(),
    eventId,
    name,
    email: normalEmail,
    abteilung,
    userId: req.user.id,
    timestamp: new Date().toISOString(),
  };
  regsExisting.push(reg);
  writeJSON('registrations.json', regsExisting);

  if (!event.anmeldungen) event.anmeldungen = [];
  event.anmeldungen.push(reg.id);
  writeJSON('events.json', events);

  res.status(201).json(reg);
});

router.get('/', requireAuth, requireAdmin, (_req, res) => {
  res.json(readJSON('registrations.json'));
});

router.get('/mine', requireAuth, (req, res) => {
  const regs = readJSON('registrations.json');
  const events = readJSON('events.json');
  const userEmail = (req.user.email || '').toLowerCase().trim();
  const userId = req.user.id;
  const myRegs = regs.filter(r =>
    r.userId === userId || (r.email || '').toLowerCase().trim() === userEmail
  );
  const enriched = myRegs.map(r => {
    const event = events.find(e => e.id === r.eventId);
    return { ...r, event: event ? { titel: event.titel, datum: event.datum, zeit: event.zeit, ort: event.ort } : null };
  });
  res.json(enriched);
});

router.delete('/:id', requireAuth, requireAdmin, (req, res) => {
  const regs = readJSON('registrations.json');
  const reg = regs.find(r => r.id === req.params.id);
  if (!reg) return res.status(404).json({ error: 'Anmeldung nicht gefunden' });

  const events = readJSON('events.json');
  const event = events.find(e => e.id === reg.eventId);
  if (event && event.anmeldungen) {
    event.anmeldungen = event.anmeldungen.filter(id => id !== reg.id);
    writeJSON('events.json', events);
  }

  const updated = regs.filter(r => r.id !== req.params.id);
  writeJSON('registrations.json', updated);
  res.json({ ok: true });
});

router.post('/admin', requireAuth, requireAdmin, (req, res) => {
  const { eventId, userId } = req.body;
  if (!eventId || !userId) return res.status(400).json({ error: 'eventId und userId erforderlich' });

  const events = readJSON('events.json');
  const event = events.find(e => e.id === eventId);
  if (!event) return res.status(404).json({ error: 'Event nicht gefunden' });

  const users = readJSON('users.json');
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User nicht gefunden' });

  const regs = readJSON('registrations.json');
  const alreadyRegistered = regs.some(r => r.eventId === eventId && r.userId === userId);
  if (alreadyRegistered) return res.status(409).json({ error: 'User ist bereits angemeldet' });

  if (event.anmeldungen && event.anmeldungen.length >= event.maxTeilnehmer) {
    return res.status(400).json({ error: 'Event ist ausgebucht' });
  }

  const reg = {
    id: generateId(),
    eventId,
    name: user.name,
    email: user.email.toLowerCase().trim(),
    userId,
    timestamp: new Date().toISOString(),
    addedByAdmin: true,
  };
  regs.push(reg);
  writeJSON('registrations.json', regs);

  if (!event.anmeldungen) event.anmeldungen = [];
  event.anmeldungen.push(reg.id);
  writeJSON('events.json', events);

  res.status(201).json(reg);
});

export default router;
