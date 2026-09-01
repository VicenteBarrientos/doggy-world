import { NextResponse } from "next/server";

import { DEMO_COOKIE } from "@/lib/demo-cookie";

/**
 * GET /demo/exit
 *
 * Clears the `demo_mode` cookie and redirects to /sign-up so the visitor can
 * create a real account.  Triggered by the "Crear mi cuenta" button in the
 * DemoBanner.
 */
export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const response = NextResponse.redirect(new URL("/sign-up", origin));
  response.cookies.set(DEMO_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0, // immediate expiry — deletes the cookie
  });
  return response;
}
