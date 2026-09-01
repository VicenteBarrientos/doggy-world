"use server";

import { revalidatePath } from "next/cache";

import {
  actionMessage,
  checkboxValue,
  requireActionUser,
  stringValue,
} from "@/lib/action-helpers";
import { fieldErrorsFromZod, type ActionState } from "@/lib/forms";
import { preferenceSchema } from "@/lib/validation";

export async function addPreferenceAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = preferenceSchema.safeParse({
    dogId: stringValue(formData, "dogId"),
    category: stringValue(formData, "category"),
    preferenceKey: stringValue(formData, "preferenceKey"),
    value: stringValue(formData, "value"),
    sentiment: stringValue(formData, "sentiment"),
    isPublic: checkboxValue(formData, "isPublic"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa esta preferencia.",
      fieldErrors: fieldErrorsFromZod(parsed.error.flatten().fieldErrors),
    };
  }

  try {
    const { supabase, user } = await requireActionUser();
    const { data: dog } = await supabase
      .from("dogs")
      .select("id")
      .eq("id", parsed.data.dogId)
      .eq("owner_id", user.id)
      .maybeSingle();
    if (!dog) throw new Error("No tienes acceso a este perro.");

    const { error } = await supabase.from("dog_preferences").upsert(
      {
        dog_id: parsed.data.dogId,
        category: parsed.data.category,
        preference_key: parsed.data.preferenceKey,
        value: parsed.data.value,
        sentiment: parsed.data.sentiment,
        source: "owner",
        is_public: parsed.data.isPublic,
      },
      { onConflict: "dog_id,category,preference_key" },
    );
    if (error) throw new Error("No pudimos guardar esta preferencia.");
  } catch (error) {
    return { status: "error", message: actionMessage(error) };
  }

  revalidatePath(`/dogs/${parsed.data.dogId}`);
  return { status: "success", message: "Preferencia guardada." };
}

export async function deletePreferenceAction(formData: FormData) {
  const preferenceId = stringValue(formData, "preferenceId");
  const dogId = stringValue(formData, "dogId");
  const { supabase } = await requireActionUser();
  await supabase.from("dog_preferences").delete().eq("id", preferenceId);
  revalidatePath(`/dogs/${dogId}`);
}
