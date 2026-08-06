import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) return res.status(401).json({ error: 'Please sign in.' });

  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError' ? 'Your session has expired. Please sign in again.' : 'Please sign in.';
    res.status(401).json({ error: message });
  }
}
