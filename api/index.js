import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import { connectDB } from '../server/db.js';
import authRoutes from '../server/routes/auth.js';
import projectRoutes from '../server/routes/projects.js';
import postRoutes from '../server/routes/posts.js';
import appointmentRoutes from '../server/routes/appointments.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));

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

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/appointments', appointmentRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

// TEMPORARY — diagnosing why RESEND_API_KEY isn't reaching the function at
// runtime. Reveals presence/length only, never the value. Remove once fixed.
app.get('/api/debug-env', (req, res) => {
  const report = (name) => {
    const v = process.env[name];
    return { present: v !== undefined, length: v ? v.length : 0 };
  };
  res.json({
    RESEND_API_KEY: report('RESEND_API_KEY'),
    NOTIFY_EMAIL: report('NOTIFY_EMAIL'),
    MONGODB_URI: report('MONGODB_URI'),
    VERCEL_ENV: process.env.VERCEL_ENV || null
  });
});

app.use('/api', (req, res) => res.status(404).json({ error: 'No such endpoint.' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong.' });
});

export default app;
