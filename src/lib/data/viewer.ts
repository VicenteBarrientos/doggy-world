import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { demoProfile } from "@/lib/demo-data";
import { isDemoCookieSet } from "@/lib/demo-cookie";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export type Viewer = {
  id: string;
  email: string | null;
  profile: Profile;
  isDemo: boolean;
};

/**
 * Returns the current viewer using the following precedence:
 *
 * 1. Automatic fallback demo  — Supabase credentials absent (local/dev)
 * 2. Real Supabase user       — valid session in HTTP-only Supabase cookies
 * 3. Explicit public demo     — demo_mode cookie present (visitor clicked VER DEMO)
 * 4. null                     — no session and no demo cookie
 *
 * A real authenticated Supabase user always takes precedence over the demo
 * cookie.  The demo cookie never creates a fake Supabase session and never
 * bypasses RLS — it only causes reads to be served from demo-data.ts.
 */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  // ── 1. Automatic fallback: no Supabase credentials ─────────────────────────
  if (!isSupabaseConfigured()) {
    return {
      id: demoProfile.id,
      email: "demo@doggy.world",
      profile: demoProfile,
      isDemo: true,
    };
  }

  // ── 2. Real Supabase session — takes full precedence ───────────────────────
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    const fallbackProfile: Profile = {
      id: user.id,
      display_name:
        typeof user.user_metadata.display_name === "string"
          ? user.user_metadata.display_name
          : "Dog lover",
      username: null,
      avatar_url: null,
      city: null,
      country: null,
      created_at: user.created_at,
      updated_at: user.updated_at ?? user.created_at,
    };

    return {
      id: user.id,
      email: user.email ?? null,
      profile: profile ?? fallbackProfile,
      isDemo: false,
    };
  }

  // ── 3. Explicit public demo cookie ─────────────────────────────────────────
  const cookieStore = await cookies();
  if (isDemoCookieSet(cookieStore)) {
    return {
      id: demoProfile.id,
      email: "demo@doggy.world",
      profile: demoProfile,
      isDemo: true,
    };
  }

  // ── 4. No session, no demo cookie ──────────────────────────────────────────
  return null;
});

export async function requireViewer() {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");
  return viewer;
}
