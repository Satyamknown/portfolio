import { Router } from 'express';
import HomeSetting from '../models/HomeSetting.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const settings = await HomeSetting.findOne().sort({ updatedAt: -1 });
    res.json(settings || { videoUrl: '', videoPoster: '' });
  } catch (err) {
    next(err);
  }
});

router.put('/', requireAuth, async (req, res, next) => {
  try {
    const payload = {
      videoUrl: req.body.videoUrl || '',
      videoPoster: req.body.videoPoster || ''
    };
    const settings = await HomeSetting.findOneAndUpdate({}, payload, {
      new: true,
      upsert: true,
      runValidators: true
    });
    res.json(settings);
  } catch (err) {
    next(err);
  }
});

export default router;
