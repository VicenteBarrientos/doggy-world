"use client";

import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseConfig } from "@/lib/supabase/config";
import type { Database } from "@/types/database";

export function createClient() {
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error("Supabase aún no está configurado.");
  }

  return createBrowserClient<Database>(config.url, config.anonKey);
}
