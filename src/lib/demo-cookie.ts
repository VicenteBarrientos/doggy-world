/**
 * Demo-mode cookie helpers.
 *
 * The `demo_mode` cookie is a plain HTTP-only session cookie (no maxAge /
 * expires) that signals an explicit public-demo session started via /demo.
 * It carries zero credentials and grants zero Supabase access — it only
 * tells the middleware and data layer to serve deterministic demo data
 * instead of requiring a real Supabase authenticated session.
 *
 * Two independent demo concepts:
 *   1. Automatic fallback  — isSupabaseConfigured() === false  (local / dev)
 *   2. Explicit public demo — DEMO_COOKIE present in HTTP-only cookies
 *
 * A real authenticated Supabase user always takes precedence over this cookie.
 * The cookie is cleared automatically when the user logs in, signs up, or
 * completes an OAuth callback.
 */

export const DEMO_COOKIE = "demo_mode" as const;
export const DEMO_COOKIE_VALUE = "1" as const;

/**
 * Cookie attributes used when writing the cookie.
 * Session cookie: no maxAge / expires — cleared when the browser session ends.
 */
export const DEMO_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  secure: process.env.NODE_ENV === "production",
} as const;

/**
 * Check whether the demo_mode cookie is present in a ReadonlyRequestCookies
 * instance (next/headers) or a Next.js RequestCookies (middleware).
 * Works with both `cookies()` from `next/headers` and `request.cookies`.
 */
export function isDemoCookieSet(
  cookieStore: { get(name: string): { value: string } | undefined },
): boolean {
  return cookieStore.get(DEMO_COOKIE)?.value === DEMO_COOKIE_VALUE;
}
