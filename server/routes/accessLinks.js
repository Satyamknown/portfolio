import crypto from 'node:crypto';
import { Router } from 'express';
import AccessLink from '../models/AccessLink.js';
import AccessLinkEvent from '../models/AccessLinkEvent.js';
import { requireAuth } from '../middleware/auth.js';
import { createAccessCookie } from '../lib/access.js';
import { classifyVisitor } from '../lib/visitor.js';

const router = Router();
const MAX_LABEL_LENGTH = 80;
const TOKEN_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';
const TOKEN_PATTERN = /^[a-z0-9-]{1,64}$/;
const WORK_PATH = /^\/work\/[a-z0-9-]{1,80}$/;

function labelSlug(label) {
  const slug = label
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24)
    .replace(/-+$/, '');
  return slug || 'link';
}

// 10 characters from 36 gives about 51 bits, so the readable prefix is not what keeps a link private.
function randomPart(length = 10) {
  let out = '';
  for (let i = 0; i < length; i += 1) out += TOKEN_ALPHABET[crypto.randomInt(TOKEN_ALPHABET.length)];
  return out;
}

// Public on purpose: a magic link has to work before the visitor has the access cookie.
export async function openAccessLink(req, res, next) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex');

  try {
    const token = req.params.token || '';
    const visitor = classifyVisitor(req);
    const now = new Date();
    // Crawlers, unfurlers and mail scanners are logged but never counted as opens.
    let link = null;
    if (TOKEN_PATTERN.test(token)) {
      link = visitor.bot
        ? await AccessLink.findOne({ token, active: true }, { _id: 1 })
        : await AccessLink.findOneAndUpdate(
            { token, active: true },
            { $inc: { opens: 1 }, $set: { lastOpenedAt: now } }
          );
    }

    // ?to= lets a link land on one case study. Only same-site /work/<slug> paths, so it cannot redirect off-site.
    const to = typeof req.query.to === 'string' && WORK_PATH.test(req.query.to) ? req.query.to : '/';

    if (link) {
      // Awaited so a serverless freeze cannot drop it; a failed write must not block the visitor.
      try {
        await AccessLinkEvent.create({ link: link._id, at: now, to, ...visitor });
      } catch (err) {
        console.error('Could not record a share-link open:', err.message);
      }
    }

    // Unknown, paused and malformed tokens all get the same redirect, so the response never says which it was.
    if (!link) return res.redirect(302, `${to}?link=expired`);

    res.setHeader('Set-Cookie', createAccessCookie());
    res.redirect(302, to);
  } catch (err) {
    next(err);
  }
}

router.use(requireAuth);

// Per-link breakdown for the Resume tracking view: human opens by landing page, and
// bot/preview hits kept apart. Covers the 180 days the events are kept.
router.get('/stats', async (req, res, next) => {
  try {
    const rows = await AccessLinkEvent.aggregate([
      { $group: { _id: { link: '$link', bot: '$bot', to: '$to' }, count: { $sum: 1 }, lastAt: { $max: '$at' } } }
    ]);

    const stats = {};
    for (const { _id, count, lastAt } of rows) {
      const entry = (stats[_id.link] ||= { pages: {}, humanEvents: 0, bots: 0, lastBotAt: null });
      if (_id.bot) {
        entry.bots += count;
        if (!entry.lastBotAt || lastAt > entry.lastBotAt) entry.lastBotAt = lastAt;
      } else {
        entry.pages[_id.to] = (entry.pages[_id.to] || 0) + count;
        entry.humanEvents += count;
      }
    }
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const links = await AccessLink.find().sort({ createdAt: -1 });
    res.json(links);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const label = typeof req.body?.label === 'string' ? req.body.label.trim() : '';
    if (!label || label.length > MAX_LABEL_LENGTH) {
      return res.status(400).json({ error: `Give the link a label of 1 to ${MAX_LABEL_LENGTH} characters.` });
    }

    // A token clash is close to impossible, but retry instead of failing if one happens.
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const link = await AccessLink.create({ label, token: `${labelSlug(label)}-${randomPart()}` });
        return res.status(201).json(link);
      } catch (err) {
        if (err.code !== 11000) throw err;
      }
    }
    res.status(500).json({ error: 'Could not create a unique link. Please try again.' });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const { active } = req.body || {};
    if (typeof active !== 'boolean') {
      return res.status(400).json({ error: 'Send active as true or false.' });
    }

    const link = await AccessLink.findByIdAndUpdate(req.params.id, { active }, { returnDocument: 'after' });
    if (!link) return res.status(404).json({ error: 'Link not found.' });
    res.json(link);
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Link not found.' });
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const link = await AccessLink.findByIdAndDelete(req.params.id);
    if (!link) return res.status(404).json({ error: 'Link not found.' });
    await AccessLinkEvent.deleteMany({ link: link._id });
    res.json({ ok: true });
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Link not found.' });
    next(err);
  }
});

export default router;
