import "server-only";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export async function requireActionUser() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "La vista demo no guarda cambios. Conecta Supabase para probar este flujo.",
    );
  }

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
