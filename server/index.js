import 'dotenv/config';
import http from 'http';
import express from 'express';
import { access, writeFile, unlink } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
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
import echoAddonsRoutes from './routes/echo-addons.js';
import changesRoutes from './routes/changes.js';
import liveInfosRoutes from './routes/live-infos.js';
import newsRoutes from './routes/news.js';
import notificationsRoutes from './routes/notifications.js';
import inboxRoutes from './routes/inbox.js';
import visibilityRoutes from './routes/visibility.js';
import sprintsRoutes from './routes/sprints.js';
import pushRoutes from './routes/push.js';
import bugtrackerRoutes from './routes/bugtracker.js';

const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const SHUTDOWN_GRACE_MS = Number(process.env.SHUTDOWN_GRACE_MS || 15000);

let activeApiRequests = 0;
let isShuttingDown = false;

function generateRequestId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

async function checkDataDirWritable() {
  try {
    await access(DATA_DIR);
    const probePath = path.join(DATA_DIR, `.healthcheck-${process.pid}-${Date.now()}.tmp`);
    await writeFile(probePath, 'ok', 'utf-8');
    await unlink(probePath);
    return true;
  } catch {
    return false;
  }
}

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
  .map(o => o.trim())
  .filter(Boolean);
const allowedOriginSet = new Set(allowedOrigins);
const stateChangingMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function getRequestSourceOrigin(req) {
  const originHeader = req.get('origin');
  if (originHeader) return originHeader;

  const refererHeader = req.get('referer');
  if (!refererHeader) return null;
  try {
    return new URL(refererHeader).origin;
  } catch {
    return null;
  }
}

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

// ── CSRF/Origin guard for cookie-authenticated write requests ───────
app.use('/api', (req, res, next) => {
  if (!stateChangingMethods.has(req.method)) return next();
  if (!req.cookies?.token) return next();

  const sourceOrigin = getRequestSourceOrigin(req);
  if (!sourceOrigin || !allowedOriginSet.has(sourceOrigin)) {
    return res.status(403).json({ error: 'Ungültige Anfrage-Quelle (Origin/Referer).' });
  }
  next();
});

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

// ── Request draining / in-flight tracking ────────────────────────────
app.use('/api', (req, res, next) => {
  if (isShuttingDown && req.path !== '/health') {
    return res.status(503).json({ error: 'Server wird neu gestartet, bitte gleich erneut versuchen.' });
  }

  activeApiRequests += 1;
  let finished = false;
  const done = () => {
    if (finished) return;
    finished = true;
    activeApiRequests = Math.max(0, activeApiRequests - 1);
  };

  res.on('finish', done);
  res.on('close', done);
  next();
});

// ── Request logging ──────────────────────────────────────────────────
app.use('/api', (req, res, next) => {
  const start = Date.now();
  const requestId = req.get('x-request-id') || generateRequestId();
  res.setHeader('x-request-id', requestId);
  res.on('finish', () => {
    console.log(JSON.stringify({
      type: 'api_request',
      requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - start,
      ip: req.ip,
      userAgent: req.get('user-agent') || '',
      at: new Date().toISOString(),
    }));
  });
  next();
});

// ── Health check ────────────────────────────────────────────────────
app.get('/api/health', async (_req, res) => {
  const dataWritable = await checkDataDirWritable();
  const health = {
    status: dataWritable ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptimeSec: Math.round(process.uptime()),
    activeApiRequests,
    shuttingDown: isShuttingDown,
    checks: {
      dataWritable,
    },
  };
  res.status(dataWritable ? 200 : 503).json(health);
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
app.use('/api/echo-addons', echoAddonsRoutes);
app.use('/api/changes', changesRoutes);
app.use('/api/live-infos', liveInfosRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/inbox', inboxRoutes);
app.use('/api/visibility', visibilityRoutes);
app.use('/api/sprints', sprintsRoutes);
app.use('/api/push', pushRoutes);
app.use('/api/bugtracker', bugtrackerRoutes);

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
    const safeMessages = { 400: 'Ungültige Anfrage', 401: 'Nicht authentifiziert', 403: 'Zugriff verweigert', 404: 'Nicht gefunden' };
    res.status(status).json({ error: safeMessages[status] || 'Interner Serverfehler' });
  } else {
    console.error(err);
    res.status(status).json({ error: err.message, stack: err.stack });
  }
});

// ── Start ───────────────────────────────────────────────────────────
const server = http.createServer(app);
const HOST = isProd ? '127.0.0.1' : '0.0.0.0';
server.listen(PORT, HOST, () => {
  console.log(`SCNAT API server running on ${HOST}:${PORT} [${isProd ? 'production' : 'development'}]`);
});

function shutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.warn(`[shutdown] Received ${signal}. Stopping new requests and draining for ${SHUTDOWN_GRACE_MS}ms.`);

  const forceExitTimer = setTimeout(() => {
    console.error('[shutdown] Grace period reached. Forcing exit.');
    process.exit(1);
  }, SHUTDOWN_GRACE_MS);
  forceExitTimer.unref();

  server.close(() => {
    clearTimeout(forceExitTimer);
    console.log('[shutdown] HTTP server closed cleanly.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
