import { createHmac, timingSafeEqual } from 'node:crypto';

export const SESSION_COOKIE_NAME = 'admin_session';
export const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

export function verifyCredentials(username: string, password: string): boolean {
  const expectedUsername = import.meta.env.ADMIN_USERNAME ?? '';
  const expectedPassword = import.meta.env.ADMIN_PASSWORD ?? '';
  if (!expectedUsername || !expectedPassword) return false;
  return safeEqual(username, expectedUsername) && safeEqual(password, expectedPassword);
}

export function createSessionToken(username: string): string {
  const secret = import.meta.env.SESSION_SECRET;
  const expires = Date.now() + SESSION_TTL_SECONDS * 1000;
  const payload = `${username}.${expires}`;
  return `${payload}.${sign(payload, secret)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const secret = import.meta.env.SESSION_SECRET;
  if (!secret) return false;

  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [username, expiresStr, signature] = parts;
  const payload = `${username}.${expiresStr}`;

  if (!safeEqual(signature, sign(payload, secret))) return false;

  const expires = Number(expiresStr);
  if (!Number.isFinite(expires) || Date.now() > expires) return false;

  return true;
}
