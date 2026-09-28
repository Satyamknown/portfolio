import crypto from 'node:crypto';
import { Router } from 'express';
import AccessLink from '../models/AccessLink.js';
import AccessLinkEvent from '../models/AccessLinkEvent.js';
import { requireAuth } from '../middleware/auth.js';
import { createAccessCookie } from '../lib/access.js';
import { classifyVisitor } from '../lib/visitor.js';
import { clearOwnerCookie, createOwnerCookie, isOwner } from '../lib/owner.js';

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
    // The owner's own browsers (marked from the dashboard) are logged but never counted either.
    const owner = isOwner(req);
    const now = new Date();
    // Crawlers, unfurlers and mail scanners are logged but never counted as opens.
    let link = null;
    if (TOKEN_PATTERN.test(token)) {
      link = visitor.bot || owner
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
        await AccessLinkEvent.create({ link: link._id, at: now, to, ...visitor, owner });
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

// "Don't count my own clicks": marks this browser as the owner's. The dashboard calls it
// on every visit, so any browser where the owner signs in stops counting.
router.get('/owner', (req, res) => res.json({ owner: isOwner(req) }));
router.post('/owner', (req, res) => {
  res.setHeader('Set-Cookie', createOwnerCookie());
  res.json({ owner: true });
});
router.delete('/owner', (req, res) => {
  res.setHeader('Set-Cookie', clearOwnerCookie());
  res.json({ owner: false });
});

// Per-link breakdown for the Resume tracking view. "Opens" here are people only:
// - bots, previews and mail scanners are counted apart (visitor.js);
// - the owner's own browsers are counted apart (owner cookie);
// - a burst of SCAN_BURST+ hits on one link within SCAN_WINDOW_MS is a scanner that
//   pretends to be a browser (LinkedIn and ATS systems fetch every link in an uploaded
//   PDF at once). No person opens four links in the same few seconds.
// Covers the 180 days the events are kept.
const SCAN_WINDOW_MS = 20 * 1000;
const SCAN_BURST = 3;

function markBursts(events) {
  const scan = new Set();
  for (let i = 0; i < events.length; i += 1) {
    let j = i;
    while (j + 1 < events.length && events[j + 1].at - events[i].at <= SCAN_WINDOW_MS) j += 1;
    if (j - i + 1 >= SCAN_BURST) for (let k = i; k <= j; k += 1) scan.add(k);
  }
  return scan;
}

router.get('/stats', async (req, res, next) => {
  try {
    const events = await AccessLinkEvent.find({}, { link: 1, at: 1, to: 1, bot: 1, owner: 1, device: 1, country: 1 })
      .sort({ at: 1 })
      .lean();
    const byLink = new Map();
    for (const e of events) {
      const key = String(e.link);
      if (!byLink.has(key)) byLink.set(key, []);
      byLink.get(key).push(e);
    }

    const stats = {};
    for (const [key, list] of byLink) {
      const entry = { pages: {}, opens: 0, lastOpenedAt: null, bots: 0, lastBotAt: null, scans: 0, mine: 0 };
      // The last few hits with their kind, so a suspicious count can be checked by hand.
      entry.recent = list.slice(-12).map((e) => ({
        at: e.at,
        to: e.to,
        device: e.device,
        country: e.country,
        kind: e.owner ? 'mine' : e.bot ? 'bot' : 'person'
      }));
      const people = list.filter((e) => !e.bot && !e.owner);
      const burst = markBursts(people);
      people.forEach((e, i) => {
        if (burst.has(i)) {
          entry.scans += 1;
          if (!entry.lastBotAt || e.at > entry.lastBotAt) entry.lastBotAt = e.at;
          return;
        }
        entry.opens += 1;
        entry.pages[e.to] = (entry.pages[e.to] || 0) + 1;
        if (!entry.lastOpenedAt || e.at > entry.lastOpenedAt) entry.lastOpenedAt = e.at;
      });
      for (const e of list) {
        if (e.owner) entry.mine += 1;
        else if (e.bot) {
          entry.bots += 1;
          if (!entry.lastBotAt || e.at > entry.lastBotAt) entry.lastBotAt = e.at;
        }
      }
      stats[key] = entry;
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
