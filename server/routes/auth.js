import crypto from 'node:crypto';
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import LoginToken from '../models/LoginToken.js';
import { send } from '../lib/notify.js';

const router = Router();

const LINK_TTL_MINUTES = 15;
const MAX_LINKS_PER_WINDOW = 5; // per 15 minutes, so the endpoint cannot be used to spam the inbox
const SITE_URL = 'https://portfolio-uplof.vercel.app';

const normalise = (email) => String(email || '').trim().toLowerCase();
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
const issueSession = (email) => jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '7d' });

// The inboxes allowed to receive a sign-in link: the admin address and the address the
// site already mails appointment notifications to (proven to receive mail from Resend).
function allowedInboxes() {
  return [process.env.ADMIN_EMAIL, process.env.NOTIFY_EMAIL].map(normalise).filter(Boolean);
}

// Links always point at the real site in production, so a spoofed Host header cannot
// send the admin a link to someone else's domain. Local dev uses its own origin.
function siteOrigin(req) {
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') return process.env.SITE_URL || SITE_URL;
  const host = req.headers.host || 'localhost:5176';
  return /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host) ? `http://${host}` : SITE_URL;
}

function signInEmail(link) {
  const subject = 'Your portfolio sign-in link';
  const text = `Sign in to your portfolio admin:\n\n${link}\n\nThe link works once and expires in ${LINK_TTL_MINUTES} minutes. If you didn't ask for it, ignore this email.`;
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#171512">
<p>Sign in to your portfolio admin:</p>
<p><a href="${link}" style="display:inline-block;padding:12px 20px;background:#171512;color:#fff;text-decoration:none;border-radius:999px">Sign in</a></p>
<p style="color:#6f6a60;font-size:13px">The link works once and expires in ${LINK_TTL_MINUTES} minutes. If you didn't ask for it, ignore this email.</p>
</div>`;
  return { subject, text, html };
}

// Step 1: email a one-time link. The reply is the same whether or not the address is
// allowed, so the form never reveals which email is the admin's.
router.post('/magic-link', async (req, res, next) => {
  const reply = () => res.json({ ok: true });
  try {
    if (!process.env.JWT_SECRET) return res.status(503).json({ error: 'Admin login is not configured yet.' });

    const email = normalise(req.body?.email);
    if (!email || !allowedInboxes().includes(email)) return reply();

    const since = new Date(Date.now() - LINK_TTL_MINUTES * 60 * 1000);
    const recent = await LoginToken.countDocuments({ email, createdAt: { $gte: since } });
    if (recent >= MAX_LINKS_PER_WINDOW) return reply();

    const token = crypto.randomBytes(32).toString('base64url');
    await LoginToken.create({
      tokenHash: hashToken(token),
      email,
      expiresAt: new Date(Date.now() + LINK_TTL_MINUTES * 60 * 1000)
    });

    const link = `${siteOrigin(req)}/login?token=${token}`;
    const result = await send({ to: email, ...signInEmail(link) });
    // Local dev has no email key: print the link so the flow can still be tested.
    if (!result.sent && !process.env.VERCEL && process.env.NODE_ENV !== 'production') {
      console.log(`[dev] sign-in link for ${email}: ${link}`);
    }
    reply();
  } catch (err) {
    next(err);
  }
});

// Step 2: the link lands on /login?token=…, which trades it for a normal admin session.
router.post('/magic-link/verify', async (req, res, next) => {
  try {
    const token = typeof req.body?.token === 'string' ? req.body.token : '';
    if (!token || !process.env.JWT_SECRET) {
      return res.status(401).json({ error: 'This sign-in link has expired or was already used.' });
    }
    const now = new Date();
    const record = await LoginToken.findOneAndUpdate(
      { tokenHash: hashToken(token), usedAt: null, expiresAt: { $gt: now } },
      { $set: { usedAt: now } }
    );
    if (!record) return res.status(401).json({ error: 'This sign-in link has expired or was already used.' });
    res.json({ token: issueSession(record.email) });
  } catch (err) {
    next(err);
  }
});

// The old email + password sign-in. The login page no longer offers it; it still works if
// ADMIN_PASSWORD_HASH is set, and is refused if that variable is removed.
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminHash = process.env.ADMIN_PASSWORD_HASH;
    if (!adminEmail || !adminHash || !process.env.JWT_SECRET) {
      return res.status(503).json({ error: 'Password sign-in is turned off. Use the email link.' });
    }

    if (normalise(email) !== normalise(adminEmail)) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const match = await bcrypt.compare(password, adminHash);
    if (!match) return res.status(401).json({ error: 'Invalid email or password.' });

    res.json({ token: issueSession(adminEmail) });
  } catch (err) {
    next(err);
  }
});

export default router;
