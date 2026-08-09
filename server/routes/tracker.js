import { Router } from 'express';
import Tracker from '../models/Tracker.js';

const router = Router();
const key = 'pm-tracker-36wk-v1';
const emptyState = { days: {}, resources: [], notes: {}, time: {} };

router.get('/', async (req, res, next) => {
  try {
    const tracker = await Tracker.findOne({ key }).lean();
    res.json({ state: { ...emptyState, ...(tracker?.state || {}) } });
  } catch (err) {
    next(err);
  }
});

router.put('/', async (req, res, next) => {
  try {
    const incoming = req.body?.state;
    if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) {
      return res.status(400).json({ error: 'A tracker state object is required.' });
    }

    const state = {
      days: incoming.days && typeof incoming.days === 'object' ? incoming.days : {},
      resources: Array.isArray(incoming.resources) ? incoming.resources.slice(0, 100) : [],
      notes: incoming.notes && typeof incoming.notes === 'object' ? incoming.notes : {},
      time: incoming.time && typeof incoming.time === 'object' ? incoming.time : {}
    };

    await Tracker.findOneAndUpdate({ key }, { key, state }, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true });
    res.json({ ok: true, state });
  } catch (err) {
    next(err);
  }
});

export default router;
