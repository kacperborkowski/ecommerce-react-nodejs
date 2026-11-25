import type { CookieOptions, Request, Response } from 'express';

// Shared by the cart (sets the cookie) and orders (clears it after checkout)

const CART_COOKIE = 'cartId';

const CART_COOKIE_OPTIONS: CookieOptions = {
  // JavaScript in the browser can't read the cookie, so a malicious script
  // can't steal the cart id. The browser still sends it with every request.
  httpOnly: true,
  // Not sent with requests started by other websites
  sameSite: 'lax',
  // Over HTTPS only, outside local development
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export function readCartId(req: Request): string | undefined {
  const value: unknown = req.cookies?.[CART_COOKIE];
  return typeof value === 'string' ? value : undefined;
}

// Set (or refresh) the cookie, so the browser remembers this cart
export function setCartCookie(res: Response, cartId: string): void {
  res.cookie(CART_COOKIE, cartId, {
    ...CART_COOKIE_OPTIONS,
    maxAge: THIRTY_DAYS_MS,
  });
}

export function clearCartCookie(res: Response): void {
  res.clearCookie(CART_COOKIE, CART_COOKIE_OPTIONS);
}
