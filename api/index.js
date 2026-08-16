import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import { connectDB } from '../server/db.js';
import authRoutes from '../server/routes/auth.js';
import accessRoutes from '../server/routes/access.js';
import projectRoutes from '../server/routes/projects.js';
import postRoutes from '../server/routes/posts.js';
import appointmentRoutes from '../server/routes/appointments.js';
import homeSettingsRoutes from '../server/routes/homeSettings.js';
import trackerRoutes from '../server/routes/tracker.js';
import { requireSiteAccess } from '../server/lib/access.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.use('/api/access', accessRoutes);
app.use('/api/auth', authRoutes);
app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use(['/api/projects', '/api/posts', '/api/appointments', '/api/home-settings', '/api/tracker'], requireSiteAccess);

// Open the database connection before any route touches it
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection failed:', err.message);
    res.status(503).json({ error: 'The database is unavailable right now.' });
  }
});

app.use('/api/projects', projectRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/home-settings', homeSettingsRoutes);
app.use('/api/tracker', trackerRoutes);

app.use('/api', (req, res) => res.status(404).json({ error: 'No such endpoint.' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong.' });
});

export default app;
