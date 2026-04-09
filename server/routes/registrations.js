import { Router } from 'express';
import { readJSON, writeJSON, generateId } from '../utils.js';
import { requireAuth } from '../auth.js';

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

router.get('/', requireAuth, (_req, res) => {
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

export default router;
