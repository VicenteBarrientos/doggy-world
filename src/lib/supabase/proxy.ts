import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { DEMO_COOKIE, isDemoCookieSet } from "@/lib/demo-cookie";
import { getSupabaseConfig } from "@/lib/supabase/config";
import type { Database } from "@/types/database";

/**
 * Routes that require either a real Supabase session or an explicit demo cookie.
 * /discover and /products are intentionally excluded — they are public and
 * allow anonymous browsing without authentication.
 */
const protectedPrefixes = [
  "/dashboard",
  "/dogs",
  "/friend-requests",
  "/settings",
  "/nearby",
  "/match",
  "/playdates",
  "/messages",
];

const authRoutes = ["/login", "/sign-up"];

export async function updateSession(request: NextRequest) {
  const config = getSupabaseConfig();
  const pathname = request.nextUrl.pathname;

  const isProtected = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const isAuthRoute = authRoutes.includes(pathname);

  // ── No Supabase configured (local/dev automatic fallback) ──────────────────
  // Skip all session work; the data layer falls back to demo-data.ts.
  if (!config) return NextResponse.next({ request });

  // ── Supabase is configured — run session refresh ───────────────────────────
  let response = NextResponse.next({ request });
  const supabase = createServerClient<Database>(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── Real authenticated user found ──────────────────────────────────────────
  // A valid Supabase session takes precedence.  Clear any stale demo cookie so
  // the real session is unambiguous, then continue normally.
  if (user) {
    if (isDemoCookieSet(request.cookies)) {
      response.cookies.set(DEMO_COOKIE, "", {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });
    }

    // Redirect authenticated users away from auth routes
    if (isAuthRoute) {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = "/dashboard";
      dashboardUrl.search = "";
      return NextResponse.redirect(dashboardUrl);
    }

    return response;
  }

  // ── No real user ───────────────────────────────────────────────────────────
  const isExplicitDemo = isDemoCookieSet(request.cookies);

  // Protected route: allow through if the explicit demo cookie is set
  if (isProtected && !isExplicitDemo) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}
