import { Router } from 'express';
import { readJSON } from '../utils.js';
import { comparePassword, signToken, verifyToken } from '../auth.js';

const router = Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'E-Mail und Passwort erforderlich' });
  }

  const users = readJSON('users.json');
  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: 'Ungültige Anmeldedaten' });

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Ungültige Anmeldedaten' });

  const token = signToken({ id: user.id, email: user.email, name: user.name, role: user.role });

  res.cookie('token', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

router.get('/me', (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'Nicht authentifiziert' });

  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ error: 'Token ungültig' });

  res.json({ user: { id: decoded.id, email: decoded.email, name: decoded.name, role: decoded.role } });
});

router.post('/logout', (_req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

export default router;
