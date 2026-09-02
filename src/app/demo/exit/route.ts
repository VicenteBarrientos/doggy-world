import { NextResponse } from "next/server";

import { DEMO_COOKIE, DEMO_COOKIE_CLEAR_OPTIONS } from "@/lib/demo-cookie";

/**
 * POST /demo/exit
 *
 * Clears the `demo_mode` cookie and redirects to /sign-up so the visitor can
 * create a real account. Triggered by the "Crear mi cuenta" form in the
 * DemoBanner. This must remain a POST so framework prefetching cannot clear
 * the demo cookie while the visitor is still browsing the demo.
 */
export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const response = NextResponse.redirect(new URL("/sign-up", origin), 303);
  response.cookies.set(DEMO_COOKIE, "", DEMO_COOKIE_CLEAR_OPTIONS);
  return response;
}
