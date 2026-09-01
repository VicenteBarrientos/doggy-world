import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { demoProfile } from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export type Viewer = {
  id: string;
  email: string | null;
  profile: Profile;
  isDemo: boolean;
};

export const getViewer = cache(async (): Promise<Viewer | null> => {
  if (!isSupabaseConfigured()) {
    return {
      id: demoProfile.id,
      email: "demo@doggy.world",
      profile: demoProfile,
      isDemo: true,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

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
});

export async function requireViewer() {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");
  return viewer;
}
