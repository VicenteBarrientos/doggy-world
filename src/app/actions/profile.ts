"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { actionMessage, requireActionUser, stringValue } from "@/lib/action-helpers";
import { fieldErrorsFromZod, type ActionState } from "@/lib/forms";

const profileSchema = z.object({
  displayName: z.string().trim().min(2, "Ingresa tu nombre.").max(60),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_]*$/, "Usa letras, números o guion bajo.")
    .max(30),
  city: z.string().trim().max(80),
  country: z.string().trim().max(80),
});

export async function updateProfileAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = profileSchema.safeParse({
    displayName: stringValue(formData, "displayName"),
    username: stringValue(formData, "username"),
    city: stringValue(formData, "city"),
    country: stringValue(formData, "country"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      fieldErrors: fieldErrorsFromZod(parsed.error.flatten().fieldErrors),
    };
  }

  try {
    const { supabase, user } = await requireActionUser();
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: parsed.data.displayName,
        username: parsed.data.username || null,
        city: parsed.data.city || null,
        country: parsed.data.country || null,
      })
      .eq("id", user.id);
    if (error?.code === "23505") throw new Error("Ese nombre de usuario ya está ocupado.");
    if (error) throw new Error("No pudimos guardar tu perfil.");
  } catch (error) {
    return { status: "error", message: actionMessage(error) };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { status: "success", message: "Perfil actualizado." };
}
