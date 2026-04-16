import { Router } from 'express';
import { readJSON, writeJSON, generateId, sanitize } from '../utils.js';
import { requireAuth, requireAdmin, hashPassword } from '../auth.js';

const router = Router();
const FILE = 'users.json';
const VALID_ROLES = ['user', 'admin'];
const MIN_PASSWORD_LENGTH = 8;

router.get('/', requireAuth, requireAdmin, (_req, res) => {
  const users = readJSON(FILE).map(({ passwordHash, ...u }) => u);
  res.json(users);
});

router.put('/', requireAuth, requireAdmin, async (req, res) => {
  const { name, email, password, role } = sanitize(req.body);
  if (!name || !email || !password) return res.status(400).json({ error: 'Felder fehlen' });
  if (password.length < MIN_PASSWORD_LENGTH) {
    return res.status(400).json({ error: `Passwort muss mindestens ${MIN_PASSWORD_LENGTH} Zeichen lang sein` });
  }
  const validRole = VALID_ROLES.includes(role) ? role : 'user';

  const normalizedEmail = email.toLowerCase().trim();
  const data = readJSON(FILE);
  if (data.some(u => u.email.toLowerCase().trim() === normalizedEmail)) {
    return res.status(400).json({ error: 'E-Mail existiert bereits' });
  }

  const passwordHash = await hashPassword(password);
  const newUser = { id: generateId(), name, email: normalizedEmail, passwordHash, role: validRole };
  data.push(newUser);
  writeJSON(FILE, data);

  const { passwordHash: _, ...safe } = newUser;
  res.status(201).json(safe);
});

router.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { name, email, role, password } = sanitize(req.body);
  const data = readJSON(FILE);
  const idx = data.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'User nicht gefunden' });

  const normalizedEmail = email ? email.toLowerCase().trim() : null;
  if (normalizedEmail && normalizedEmail !== data[idx].email.toLowerCase().trim() &&
      data.some(u => u.email.toLowerCase().trim() === normalizedEmail && u.id !== req.params.id)) {
    return res.status(400).json({ error: 'E-Mail existiert bereits' });
  }
  if (password && password.length < MIN_PASSWORD_LENGTH) {
    return res.status(400).json({ error: `Passwort muss mindestens ${MIN_PASSWORD_LENGTH} Zeichen lang sein` });
  }

  if (name) data[idx].name = name;
  if (normalizedEmail) data[idx].email = normalizedEmail;
  if (role && VALID_ROLES.includes(role)) data[idx].role = role;
  if (password) data[idx].passwordHash = await hashPassword(password);

  writeJSON(FILE, data);
  const { passwordHash: _, ...safe } = data[idx];
  res.json(safe);
});

router.delete('/:id', requireAuth, requireAdmin, (req, res) => {
  if (req.params.id === req.user.id) return res.status(400).json({ error: 'Eigenen Account nicht löschbar' });
  let data = readJSON(FILE);
  data = data.filter(u => u.id !== req.params.id);
  writeJSON(FILE, data);
  res.json({ ok: true });
});

export default router;
