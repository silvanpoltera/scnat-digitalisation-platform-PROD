import { Router } from 'express';
import { readJSON, writeJSON, generateId } from '../utils.js';
import { requireAuth, requireAdmin, hashPassword } from '../auth.js';

const router = Router();
const FILE = 'users.json';

router.get('/', requireAuth, requireAdmin, (_req, res) => {
  const users = readJSON(FILE).map(({ passwordHash, ...u }) => u);
  res.json(users);
});

router.put('/', requireAuth, requireAdmin, async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Felder fehlen' });

  const data = readJSON(FILE);
  if (data.some(u => u.email === email)) return res.status(400).json({ error: 'E-Mail existiert bereits' });

  const passwordHash = await hashPassword(password);
  const newUser = { id: generateId(), name, email, passwordHash, role: role || 'user' };
  data.push(newUser);
  writeJSON(FILE, data);

  const { passwordHash: _, ...safe } = newUser;
  res.status(201).json(safe);
});

router.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { name, email, role, password } = req.body;
  const data = readJSON(FILE);
  const idx = data.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'User nicht gefunden' });

  if (email && email !== data[idx].email && data.some(u => u.email === email && u.id !== req.params.id)) {
    return res.status(400).json({ error: 'E-Mail existiert bereits' });
  }

  if (name) data[idx].name = name;
  if (email) data[idx].email = email;
  if (role) data[idx].role = role;
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
