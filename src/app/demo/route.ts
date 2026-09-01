import { NextResponse } from "next/server";

import { DEMO_COOKIE, DEMO_COOKIE_OPTIONS, DEMO_COOKIE_VALUE } from "@/lib/demo-cookie";

/**
 * GET /demo
 *
 * Public demo entry point.  Sets the `demo_mode` HTTP-only session cookie and
 * redirects to /dashboard.  No Supabase session is created; the data layer
 * recognises the cookie and serves deterministic synthetic data.
 */
export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const response = NextResponse.redirect(new URL("/dashboard", origin));
  response.cookies.set(DEMO_COOKIE, DEMO_COOKIE_VALUE, DEMO_COOKIE_OPTIONS);
  return response;
}
