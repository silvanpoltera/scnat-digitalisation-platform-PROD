import { Router } from 'express';
import { readJSONAsync, writeJSONAtomic, withDataLock, generateId, sanitize } from '../utils.js';
import { requireAuth, requireAdmin, hashPassword } from '../auth.js';

const router = Router();
const FILE = 'users.json';
const VALID_ROLES = ['user', 'admin'];
const MIN_PASSWORD_LENGTH = 8;

router.get('/', requireAuth, requireAdmin, async (_req, res) => {
  const users = (await readJSONAsync(FILE)).map(({ passwordHash, ...u }) => u);
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
  const passwordHash = await hashPassword(password);
  let newUser;
  let duplicate = false;
  await withDataLock(async () => {
    const data = await readJSONAsync(FILE);
    if (data.some(u => u.email.toLowerCase().trim() === normalizedEmail)) {
      duplicate = true;
      return;
    }
    newUser = { id: generateId(), name, email: normalizedEmail, passwordHash, role: validRole };
    data.push(newUser);
    await writeJSONAtomic(FILE, data);
  });
  if (duplicate) return res.status(400).json({ error: 'E-Mail existiert bereits' });

  const { passwordHash: _, ...safe } = newUser;
  res.status(201).json(safe);
});

router.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { name, email, role, password } = sanitize(req.body);
  const normalizedEmail = email ? email.toLowerCase().trim() : null;
  if (password && password.length < MIN_PASSWORD_LENGTH) {
    return res.status(400).json({ error: `Passwort muss mindestens ${MIN_PASSWORD_LENGTH} Zeichen lang sein` });
  }
  const passwordHash = password ? await hashPassword(password) : null;
  let updatedUser;
  let duplicate = false;
  let notFound = false;
  await withDataLock(async () => {
    const data = await readJSONAsync(FILE);
    const idx = data.findIndex(u => u.id === req.params.id);
    if (idx === -1) {
      notFound = true;
      return;
    }

    if (normalizedEmail && normalizedEmail !== data[idx].email.toLowerCase().trim() &&
        data.some(u => u.email.toLowerCase().trim() === normalizedEmail && u.id !== req.params.id)) {
      duplicate = true;
      return;
    }

    if (name) data[idx].name = name;
    if (normalizedEmail) data[idx].email = normalizedEmail;
    if (role && VALID_ROLES.includes(role)) data[idx].role = role;
    if (passwordHash) data[idx].passwordHash = passwordHash;
    updatedUser = data[idx];
    await writeJSONAtomic(FILE, data);
  });
  if (notFound) return res.status(404).json({ error: 'User nicht gefunden' });
  if (duplicate) return res.status(400).json({ error: 'E-Mail existiert bereits' });
  const { passwordHash: _, ...safe } = updatedUser;
  res.json(safe);
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  if (req.params.id === req.user.id) return res.status(400).json({ error: 'Eigenen Account nicht löschbar' });
  await withDataLock(async () => {
    let data = await readJSONAsync(FILE);
    data = data.filter(u => u.id !== req.params.id);
    await writeJSONAtomic(FILE, data);
  });
  res.json({ ok: true });
});

export default router;
