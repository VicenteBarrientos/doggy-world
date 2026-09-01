import "server-only";

import { cookies } from "next/headers";

import { isDemoCookieSet } from "@/lib/demo-cookie";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

/**
 * Verifies that the current request has a real Supabase authenticated session
 * before executing any mutating server action.
 *
 * Throws with a user-friendly Spanish message in three cases:
 *   1. Automatic demo fallback  — Supabase not configured
 *   2. Explicit public demo     — demo_mode cookie present (no real session)
 *   3. Session expired / absent — no authenticated user found
 *
 * This ensures demo visitors can never write to production Supabase tables,
 * even if they somehow invoke a server action directly.
 */
export async function requireActionUser() {
  // Guard 1: no Supabase credentials at all (local/dev automatic fallback)
  if (!isSupabaseConfigured()) {
    throw new Error(
      "La vista demo no guarda cambios. Conecta Supabase para probar este flujo.",
    );
  }

  // Guard 2: explicit public demo cookie present — no real session exists
  const cookieStore = await cookies();
  if (isDemoCookieSet(cookieStore)) {
    throw new Error(
      "La vista demo no guarda cambios. Crea tu cuenta para guardar datos de forma permanente.",
    );
  }

  // Guard 3: Supabase is configured but no authenticated user
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Tu sesión expiró. Vuelve a iniciar sesión.");
  }

  return { supabase, user };
}

export function checkboxValue(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

export function optionalBooleanValue(formData: FormData, key: string) {
  const value = formData.get(key);
  if (value === "true" || value === "yes") return true;
  if (value === "false" || value === "no") return false;
  return undefined;
}

export function stringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export function actionMessage(error: unknown) {
  if (error instanceof Error) {
    const msg = error.message;
    const lower = msg.toLowerCase();
    if (
      lower.includes("violates") ||
      lower.includes("duplicate key") ||
      lower.includes("relation") ||
      lower.includes("postgres") ||
      lower.includes("pgrst") ||
      lower.includes("column") ||
      lower.includes("constraint") ||
      lower.includes("syntax")
    ) {
      console.error("[Database Error]", error);
      return "No pudimos completar la operación debido a un problema de datos. Por favor inténtalo nuevamente.";
    }
    return msg;
  }
  return "Ocurrió un error inesperado. Inténtalo nuevamente.";
}
