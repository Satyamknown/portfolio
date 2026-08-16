import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';

const COOKIE_NAME = 'portfolio_access';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function accessPassword() {
  return process.env.SITE_ACCESS_PASSWORD || process.env.PORTFOLIO_ACCESS_PASSWORD || '';
}

function signingSecret() {
  return process.env.SITE_ACCESS_SECRET || process.env.JWT_SECRET || accessPassword();
}

function parseCookies(header = '') {
  return header.split(';').reduce((cookies, part) => {
    const [rawName, ...rest] = part.trim().split('=');
    if (!rawName || rest.length === 0) return cookies;
    cookies[rawName] = decodeURIComponent(rest.join('='));
    return cookies;
  }, {});
}

function sign(value) {
  return crypto.createHmac('sha256', signingSecret()).update(value).digest('base64url');
}

function timingSafeEqual(a, b) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export function isAccessRequired() {
  return Boolean(accessPassword());
}

export function createAccessCookie() {
  const issuedAt = Date.now().toString();
  const token = `${issuedAt}.${sign(issuedAt)}`;
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${MAX_AGE_SECONDS}; HttpOnly; SameSite=Lax${secure}`;
}

export function clearAccessCookie() {
  return `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`;
}

export function hasAccess(req) {
  if (!isAccessRequired()) return true;

  const cookies = parseCookies(req.headers.cookie || '');
  const token = cookies[COOKIE_NAME];
  if (!token) return false;

  const [issuedAt, signature] = token.split('.');
  if (!issuedAt || !signature) return false;

  const ageMs = Date.now() - Number(issuedAt);
  if (!Number.isFinite(ageMs) || ageMs < 0 || ageMs > MAX_AGE_SECONDS * 1000) return false;

  return timingSafeEqual(signature, sign(issuedAt));
}

export function passwordMatches(value) {
  const expected = accessPassword();
  if (!expected) return true;
  return timingSafeEqual(String(value || ''), expected);
}

export function hasAdminAuth(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token || !process.env.JWT_SECRET) return false;

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export function requireSiteAccess(req, res, next) {
  if (hasAccess(req) || hasAdminAuth(req)) return next();
  res.status(401).json({ error: 'This portfolio is private. Please enter the access password.' });
}
