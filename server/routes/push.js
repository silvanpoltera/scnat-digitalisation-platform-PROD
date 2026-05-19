import { Router } from 'express';
import { requireAuth } from '../auth.js';
import {
  isPushReady,
  getPublicKey,
  addSubscription,
  removeSubscription,
} from '../push.js';

const router = Router();

router.get('/public-key', (req, res) => {
  if (!isPushReady()) {
    return res.status(503).json({ error: 'Push nicht konfiguriert' });
  }
  res.json({ publicKey: getPublicKey() });
});

router.post('/subscribe', requireAuth, async (req, res) => {
  if (!isPushReady()) {
    return res.status(503).json({ error: 'Push nicht konfiguriert' });
  }
  const sub = req.body;
  if (!sub || typeof sub.endpoint !== 'string' || !sub.keys?.p256dh || !sub.keys?.auth) {
    return res.status(400).json({ error: 'Ungültige Subscription' });
  }
  if (sub.endpoint.length > 1000) {
    return res.status(400).json({ error: 'Endpoint zu lang' });
  }
  const userAgent = String(req.headers['user-agent'] || '').slice(0, 200);
  const ok = await addSubscription(req.user.id, sub, userAgent);
  if (!ok) return res.status(400).json({ error: 'Subscription nicht akzeptiert' });
  res.json({ ok: true });
});

router.post('/unsubscribe', requireAuth, async (req, res) => {
  const { endpoint } = req.body || {};
  if (!endpoint || typeof endpoint !== 'string') {
    return res.status(400).json({ error: 'endpoint erforderlich' });
  }
  await removeSubscription(req.user.id, endpoint);
  res.json({ ok: true });
});

export default router;
