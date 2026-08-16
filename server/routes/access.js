import { Router } from 'express';
import { clearAccessCookie, createAccessCookie, hasAccess, isAccessRequired, passwordMatches } from '../lib/access.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({ required: isAccessRequired(), ok: hasAccess(req) });
});

router.post('/', (req, res) => {
  const { password } = req.body || {};
  if (!passwordMatches(password)) {
    return res.status(401).json({ error: 'That password is not right.' });
  }

  res.setHeader('Set-Cookie', createAccessCookie());
  res.json({ ok: true });
});

router.delete('/', (req, res) => {
  res.setHeader('Set-Cookie', clearAccessCookie());
  res.json({ ok: true });
});

export default router;
