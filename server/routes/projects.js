import { Router } from 'express';
import Project from '../models/Project.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

async function listPublished(req, res, next) {
  try {
    const projects = await Project.find({ published: true }).sort({ order: 1, createdAt: -1 });
    res.json(projects);
  } catch (err) {
    next(err);
  }
}

async function listAll(req, res, next) {
  try {
    const projects = await Project.find().sort({ order: 1, createdAt: -1 });
    res.json(projects);
  } catch (err) {
    next(err);
  }
}

router.get('/', (req, res, next) => {
  if (req.query.all) return requireAuth(req, res, () => listAll(req, res, next));
  listPublished(req, res, next);
});

router.get('/:slug', async (req, res, next) => {
  try {
    const project = await Project.findOne({ slug: req.params.slug, published: true });
    if (!project) return res.status(404).json({ error: 'Case study not found.' });
    res.json(project);
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json(project);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'That slug is already taken.' });
    next(err);
  }
});

router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!project) return res.status(404).json({ error: 'Case study not found.' });
    res.json(project);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'That slug is already taken.' });
    next(err);
  }
});

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ error: 'Case study not found.' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
