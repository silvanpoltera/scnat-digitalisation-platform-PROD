import { Router } from 'express';
import { readJSONAsync, writeJSONAtomic, generateId, sanitize, withDataLock } from '../utils.js';
import { requireAuth, requireAdmin } from '../auth.js';
import { sendToAdmins, fireAndForget } from '../push.js';

const router = Router();

router.post('/', requireAuth, async (req, res) => {
  const { eventId, name, email, abteilung } = sanitize(req.body);
  if (!eventId || !name || !email) return res.status(400).json({ error: 'Felder fehlen' });

  const normalEmail = email.toLowerCase().trim();
  let reg;
  let eventTitle;
  try {
    await withDataLock(async () => {
      const events = await readJSONAsync('events.json');
      const event = events.find(e => e.id === eventId);
      if (!event) {
        res.status(404).json({ error: 'Event nicht gefunden' });
        return;
      }

      if (event.maxTeilnehmer && event.anmeldungen && event.anmeldungen.length >= event.maxTeilnehmer) {
        res.status(400).json({ error: 'Ausgebucht' });
        return;
      }

      const regsExisting = await readJSONAsync('registrations.json');
      const alreadyRegistered = regsExisting.some(r =>
        r.eventId === eventId && (r.userId === req.user.id || (r.email || '').toLowerCase().trim() === normalEmail)
      );
      if (alreadyRegistered) {
        res.status(409).json({ error: 'Du bist bereits für dieses Event angemeldet.' });
        return;
      }

      reg = {
        id: generateId(),
        eventId,
        name,
        email: normalEmail,
        abteilung,
        userId: req.user.id,
        timestamp: new Date().toISOString(),
      };
      eventTitle = event.titel;
      regsExisting.push(reg);
      if (!event.anmeldungen) event.anmeldungen = [];
      event.anmeldungen.push(reg.id);

      await writeJSONAtomic('registrations.json', regsExisting);
      await writeJSONAtomic('events.json', events);
    });
  } catch (error) {
    console.error('Registrierung fehlgeschlagen:', error);
    return res.status(500).json({ error: 'Anmeldung konnte nicht gespeichert werden' });
  }
  if (!reg) return;

  fireAndForget(sendToAdmins({
    title: 'Neue Event-Anmeldung',
    body: `${reg.name} → ${eventTitle}`,
    url: '/cp/events',
    tag: `event-reg-${reg.id}`,
  }));

  res.status(201).json(reg);
});

router.get('/', requireAuth, requireAdmin, async (_req, res) => {
  res.json(await readJSONAsync('registrations.json'));
});

router.get('/mine', requireAuth, async (req, res) => {
  const regs = await readJSONAsync('registrations.json');
  const events = await readJSONAsync('events.json');
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

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  let notFound = false;
  try {
    await withDataLock(async () => {
      const regs = await readJSONAsync('registrations.json');
      const reg = regs.find(r => r.id === req.params.id);
      if (!reg) {
        notFound = true;
        return;
      }

      const events = await readJSONAsync('events.json');
      const event = events.find(e => e.id === reg.eventId);
      if (event && event.anmeldungen) {
        event.anmeldungen = event.anmeldungen.filter(id => id !== reg.id);
        await writeJSONAtomic('events.json', events);
      }

      const updated = regs.filter(r => r.id !== req.params.id);
      await writeJSONAtomic('registrations.json', updated);
    });
  } catch (error) {
    console.error('Löschen der Anmeldung fehlgeschlagen:', error);
    return res.status(500).json({ error: 'Anmeldung konnte nicht gelöscht werden' });
  }
  if (notFound) return res.status(404).json({ error: 'Anmeldung nicht gefunden' });
  res.json({ ok: true });
});

router.post('/admin', requireAuth, requireAdmin, async (req, res) => {
  const { eventId, userId } = sanitize(req.body);
  if (!eventId || !userId) return res.status(400).json({ error: 'eventId und userId erforderlich' });
  let reg;
  try {
    await withDataLock(async () => {
      const events = await readJSONAsync('events.json');
      const event = events.find(e => e.id === eventId);
      if (!event) {
        res.status(404).json({ error: 'Event nicht gefunden' });
        return;
      }

      const users = await readJSONAsync('users.json');
      const user = users.find(u => u.id === userId);
      if (!user) {
        res.status(404).json({ error: 'User nicht gefunden' });
        return;
      }

      const regs = await readJSONAsync('registrations.json');
      const alreadyRegistered = regs.some(r => r.eventId === eventId && r.userId === userId);
      if (alreadyRegistered) {
        res.status(409).json({ error: 'User ist bereits angemeldet' });
        return;
      }

      if (event.maxTeilnehmer && event.anmeldungen && event.anmeldungen.length >= event.maxTeilnehmer) {
        res.status(400).json({ error: 'Event ist ausgebucht' });
        return;
      }

      reg = {
        id: generateId(),
        eventId,
        name: user.name,
        email: user.email.toLowerCase().trim(),
        userId,
        timestamp: new Date().toISOString(),
        addedByAdmin: true,
      };
      regs.push(reg);
      if (!event.anmeldungen) event.anmeldungen = [];
      event.anmeldungen.push(reg.id);

      await writeJSONAtomic('registrations.json', regs);
      await writeJSONAtomic('events.json', events);
    });
  } catch (error) {
    console.error('Admin-Anmeldung fehlgeschlagen:', error);
    return res.status(500).json({ error: 'Anmeldung konnte nicht gespeichert werden' });
  }
  if (!reg) return;
  res.status(201).json(reg);
});

export default router;
