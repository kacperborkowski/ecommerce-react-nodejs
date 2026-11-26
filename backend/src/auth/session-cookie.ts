import type { CookieOptions, Request, Response } from 'express';

const SESSION_COOKIE = 'sessionId';

const SESSION_COOKIE_OPTIONS: CookieOptions = {
  // JavaScript in the browser can't read the cookie, so a malicious script
  // (XSS) can't steal the session. The browser still sends it automatically.
  httpOnly: true,
  // Not sent with forms or requests started by other websites (basic CSRF
  // protection)
  sameSite: 'lax',
  // Over HTTPS only, outside local development
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

export const SESSION_DURATION_DAYS = 30;

export function readSessionToken(req: Request): string | undefined {
  const value: unknown = req.cookies?.[SESSION_COOKIE];
  return typeof value === 'string' ? value : undefined;
}

export function setSessionCookie(res: Response, token: string): void {
  res.cookie(SESSION_COOKIE, token, {
    ...SESSION_COOKIE_OPTIONS,
    maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000,
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE, SESSION_COOKIE_OPTIONS);
}
