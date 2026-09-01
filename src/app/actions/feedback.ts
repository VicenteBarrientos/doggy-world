"use server";

import { revalidatePath } from "next/cache";

import {
  actionMessage,
  checkboxValue,
  optionalBooleanValue,
  requireActionUser,
  stringValue,
} from "@/lib/action-helpers";
import { fieldErrorsFromZod, type ActionState } from "@/lib/forms";
import { productFeedbackSchema } from "@/lib/validation";

export async function saveProductFeedbackAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = productFeedbackSchema.safeParse({
    dogId: stringValue(formData, "dogId"),
    productId: stringValue(formData, "productId"),
    reaction: stringValue(formData, "reaction"),
    rating: stringValue(formData, "rating"),
    favorite: checkboxValue(formData, "favorite"),
    destroyed: optionalBooleanValue(formData, "destroyed"),
    lifetimeHours: stringValue(formData, "lifetimeHours"),
    accepted: optionalBooleanValue(formData, "accepted"),
    wouldBuyAgain: optionalBooleanValue(formData, "wouldBuyAgain"),
    possibleReaction: optionalBooleanValue(formData, "possibleReaction"),
    notes: stringValue(formData, "notes") || undefined,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Elige cómo reaccionó tu perro.",
      fieldErrors: fieldErrorsFromZod(parsed.error.flatten().fieldErrors),
    };
  }

  try {
    const { supabase, user } = await requireActionUser();
    const [{ data: dog }, { data: product }] = await Promise.all([
      supabase
        .from("dogs")
        .select("id")
        .eq("id", parsed.data.dogId)
        .eq("owner_id", user.id)
        .maybeSingle(),
      supabase
        .from("products")
        .select("id, category")
        .eq("id", parsed.data.productId)
        .eq("is_active", true)
        .maybeSingle(),
    ]);
    if (!dog) throw new Error("No tienes acceso a este perro.");
    if (!product) throw new Error("Este producto ya no está disponible.");

    const isToy = product.category === "toy";
    const isEdible = product.category === "treat" || product.category === "food";
    const { error } = await supabase.from("dog_product_interactions").upsert(
      {
        dog_id: parsed.data.dogId,
        product_id: parsed.data.productId,
        reaction: parsed.data.reaction,
        rating: parsed.data.rating ?? null,
        favorite: parsed.data.favorite,
        destroyed: isToy ? (parsed.data.destroyed ?? null) : null,
        lifetime_hours: isToy ? (parsed.data.lifetimeHours ?? null) : null,
        accepted: isEdible ? (parsed.data.accepted ?? null) : null,
        would_buy_again: parsed.data.wouldBuyAgain ?? null,
        possible_reaction: isEdible ? (parsed.data.possibleReaction ?? null) : null,
        notes: parsed.data.notes ?? null,
      },
      { onConflict: "dog_id,product_id" },
    );
    if (error) throw new Error("No pudimos guardar esta opinión.");
  } catch (error) {
    return { status: "error", message: actionMessage(error) };
  }

  revalidatePath(`/dogs/${parsed.data.dogId}`);
  revalidatePath(`/dogs/${parsed.data.dogId}/products`);
  return { status: "success", message: "¡Opinión guardada! Ya conocemos mejor sus gustos." };
}
