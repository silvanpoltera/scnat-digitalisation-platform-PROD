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

  const reg = { id: generateId(), eventId, name, email, abteilung, timestamp: new Date().toISOString() };
  const regs = readJSON('registrations.json');
  regs.push(reg);
  writeJSON('registrations.json', regs);

  if (!event.anmeldungen) event.anmeldungen = [];
  event.anmeldungen.push(reg.id);
  writeJSON('events.json', events);

  res.status(201).json(reg);
});

router.get('/', requireAuth, (_req, res) => {
  res.json(readJSON('registrations.json'));
});

export default router;
