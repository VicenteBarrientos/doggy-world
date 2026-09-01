"use server";

import { redirect } from "next/navigation";

import { actionMessage, stringValue } from "@/lib/action-helpers";
import { fieldErrorsFromZod, type ActionState } from "@/lib/forms";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, signUpSchema } from "@/lib/validation";

export async function loginAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: stringValue(formData, "email"),
    password: stringValue(formData, "password"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      fieldErrors: fieldErrorsFromZod(parsed.error.flatten().fieldErrors),
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      status: "error",
      message:
        "Supabase aún no está conectado. Puedes recorrer la experiencia demo desde el inicio.",
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error) {
      return {
        status: "error",
        message: "El correo o la contraseña no coinciden.",
      };
    }
  } catch (error) {
    return { status: "error", message: actionMessage(error) };
  }

  redirect("/dashboard");
}

function friendlyAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("already registered") || lower.includes("already exists") || lower.includes("user_already_exists")) {
    return "Este correo ya tiene una cuenta registrada. Por favor inicia sesión.";
  }
  if (lower.includes("invalid login credentials") || lower.includes("invalid credentials")) {
    return "El correo o la contraseña no coinciden.";
  }
  if (lower.includes("rate limit") || lower.includes("too many requests")) {
    return "Demasiados intentos seguidos. Por favor espera unos momentos.";
  }
  if (lower.includes("password")) {
    return "La contraseña debe tener al menos 8 caracteres.";
  }
  return "No pudimos procesar tu solicitud. Por favor inténtalo de nuevo.";
}

export async function signUpAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = signUpSchema.safeParse({
    displayName: stringValue(formData, "displayName"),
    email: stringValue(formData, "email"),
    password: stringValue(formData, "password"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      fieldErrors: fieldErrorsFromZod(parsed.error.flatten().fieldErrors),
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      status: "error",
      message:
        "Supabase aún no está conectado. Configura las variables del archivo .env.example para crear cuentas.",
    };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: { display_name: parsed.data.displayName },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`,
      },
    });

    if (error) {
      return { status: "error", message: friendlyAuthError(error.message) };
    }

    if (!data.session) {
      return {
        status: "success",
        message: "Cuenta creada. Revisa tu correo para confirmar el acceso.",
      };
    }
  } catch (error) {
    return { status: "error", message: actionMessage(error) };
  }

  redirect("/dogs/new");
}

export async function signOutAction() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}
