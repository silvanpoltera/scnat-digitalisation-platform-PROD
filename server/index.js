import http from 'http';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

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

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

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

const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`SCNAT API server running on http://localhost:${PORT}`);
});
