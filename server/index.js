import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import massnahmenRoutes from './routes/massnahmen.js';
import eventsRoutes from './routes/events.js';
import registrationsRoutes from './routes/registrations.js';
import requestsRoutes from './routes/requests.js';
import usersRoutes from './routes/users.js';
import softwareVotesRoutes from './routes/software-votes.js';
import schulungsthemenRoutes from './routes/schulungsthemen.js';
import contentRoutes from './routes/content.js';
import scnatInfraRoutes from './routes/scnat-infra.js';
import kiContentRoutes from './routes/ki-content.js';
import changesRoutes from './routes/changes.js';
import liveInfosRoutes from './routes/live-infos.js';
import newsRoutes from './routes/news.js';
import notificationsRoutes from './routes/notifications.js';
import inboxRoutes from './routes/inbox.js';

const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

// ── Trust proxy (required behind nginx / GCE load balancer) ─────────
app.set('trust proxy', 1);

// ── Security headers ────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: isProd ? undefined : false,
  crossOriginEmbedderPolicy: false,
}));

// ── CORS ────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin(origin, cb) {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('CORS: origin not allowed'));
  },
  credentials: true,
}));

// ── Body parsing with size limits ───────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// ── Rate limiting ───────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 60_000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Zu viele Anfragen — bitte kurz warten.' },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60_000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS',
  message: { error: 'Zu viele Login-Versuche — bitte 15 Minuten warten.' },
});

app.use('/api', globalLimiter);
app.use('/api/auth/login', loginLimiter);

// ── Health check ────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// ── Routes ──────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/massnahmen', massnahmenRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/registrations', registrationsRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/software-votes', softwareVotesRoutes);
app.use('/api/schulungsthemen', schulungsthemenRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/scnat-infra', scnatInfraRoutes);
app.use('/api/ki-content', kiContentRoutes);
app.use('/api/changes', changesRoutes);
app.use('/api/live-infos', liveInfosRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/inbox', inboxRoutes);

// ── 404 catch-all for unknown API routes ────────────────────────────
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Endpoint nicht gefunden' });
  }
  next();
});

// ── Global error handler ────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  if (isProd) {
    console.error(`[ERROR] ${err.message}`);
    res.status(status).json({ error: status === 500 ? 'Interner Serverfehler' : err.message });
  } else {
    console.error(err);
    res.status(status).json({ error: err.message, stack: err.stack });
  }
});

// ── Start ───────────────────────────────────────────────────────────
const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`SCNAT API server running on port ${PORT} [${isProd ? 'production' : 'development'}]`);
});
