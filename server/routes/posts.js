import { Router } from 'express';
import Post from '../models/Post.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

async function listPublished(req, res, next) {
  try {
    const posts = await Post.find({ published: true }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    next(err);
  }
}

async function listAll(req, res, next) {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
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
    const post = await Post.findOne({ slug: req.params.slug, published: true });
    if (!post) return res.status(404).json({ error: 'Post not found.' });
    res.json(post);
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const post = await Post.create(req.body);
    res.status(201).json(post);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'That slug is already taken.' });
    next(err);
  }
});

router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!post) return res.status(404).json({ error: 'Post not found.' });
    res.json(post);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'That slug is already taken.' });
    next(err);
  }
});

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found.' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
