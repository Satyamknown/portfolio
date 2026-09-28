import crypto from 'node:crypto';

// Marks the owner's own browsers so their share-link clicks are not counted as a company
// opening the resume. The admin dashboard sets it (signed in only); openAccessLink reads it.
// It carries no identity: just a signed constant, so a visitor cannot forge it.
const COOKIE_NAME = 'portfolio_owner';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 400; // browsers cap cookie lifetime near 400 days

function secret() {
  return process.env.SITE_ACCESS_SECRET || process.env.JWT_SECRET || '';
}

function expectedValue() {
  return crypto.createHmac('sha256', secret()).update('portfolio-owner-v1').digest('base64url');
}

function readCookie(header = '', name) {
  for (const part of header.split(';')) {
    const [rawName, ...rest] = part.trim().split('=');
    if (rawName === name && rest.length) return decodeURIComponent(rest.join('='));
  }
  return '';
}

export function isOwner(req) {
  if (!secret()) return false;
  const value = readCookie(req.headers.cookie, COOKIE_NAME);
  if (!value) return false;
  const a = Buffer.from(value);
  const b = Buffer.from(expectedValue());
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function cookie(value, maxAge) {
  const secure = process.env.NODE_ENV === 'production' || process.env.VERCEL ? '; Secure' : '';
  return `${COOKIE_NAME}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${secure}`;
}

export const createOwnerCookie = () => cookie(expectedValue(), MAX_AGE_SECONDS);
export const clearOwnerCookie = () => cookie('', 0);
