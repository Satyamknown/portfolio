import { Router } from 'express';
import DesignStudy from '../models/DesignStudy.js';

// Read-only for now. Content comes from scripts/design-studies/ via scripts/seed-design.js.
const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const studies = await DesignStudy.find({ published: true })
      .select('slug title tagline client role timeline summary heroImage heroAlt impact tools order')
      .sort({ order: 1, createdAt: -1 });
    res.json(studies);
  } catch (err) {
    next(err);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const study = await DesignStudy.findOne({ slug: req.params.slug, published: true });
    if (!study) return res.status(404).json({ error: 'Case study not found.' });
    // The next published study, wrapping around, for the link at the end of the page.
    const all = await DesignStudy.find({ published: true }).select('slug title tagline heroImage').sort({ order: 1, createdAt: -1 });
    const i = all.findIndex((s) => s.slug === study.slug);
    const next = all.length > 1 ? all[(i + 1) % all.length] : null;
    res.json({ ...study.toObject(), next });
  } catch (err) {
    next(err);
  }
});

export default router;
