"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  actionMessage,
  checkboxValue,
  requireActionUser,
  stringValue,
} from "@/lib/action-helpers";
import { type ActionState } from "@/lib/forms";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const locationSchema = z.object({
  dogId: z.string().uuid("Selecciona un perro válido."),
  lat: z.coerce.number().min(-90).max(90, "Latitud inválida."),
  lng: z.coerce.number().min(-180).max(180, "Longitud inválida."),
  nearbyEnabled: z.boolean().default(true),
  city: z.string().trim().max(100).optional().nullable(),
  locationLabel: z.string().trim().max(100).optional().nullable(),
});

export async function saveDogLocationAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = locationSchema.safeParse({
    dogId: stringValue(formData, "dogId"),
    lat: stringValue(formData, "lat"),
    lng: stringValue(formData, "lng"),
    nearbyEnabled: formData.has("nearbyEnabled")
      ? checkboxValue(formData, "nearbyEnabled")
      : true,
    city: stringValue(formData, "city") || null,
    locationLabel: stringValue(formData, "locationLabel") || null,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Datos de ubicación inválidos.",
    };
  }

  try {
    const { supabase, user } = await requireActionUser();
    const { data: dog } = await supabase
      .from("dogs")
      .select("id, owner_id")
      .eq("id", parsed.data.dogId)
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!dog) {
      throw new Error("No tienes permisos para actualizar este perro.");
    }

    if (isSupabaseConfigured()) {
      const pointWkt = `POINT(${parsed.data.lng} ${parsed.data.lat})`;
      const { error } = await supabase.from("dog_locations").upsert(
        {
          dog_id: parsed.data.dogId,
          location: pointWkt,
          nearby_enabled: parsed.data.nearbyEnabled,
          city: parsed.data.city,
          location_label: parsed.data.locationLabel,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "dog_id" },
      );

      if (error) {
        console.error("[Location Save Error]", error);
        throw new Error("No pudimos guardar tu ubicación en este momento.");
      }
    }

    revalidatePath("/nearby");
    revalidatePath("/match");
    return {
      status: "success",
      message: "Ubicación guardada con éxito.",
    };
  } catch (error) {
    return { status: "error", message: actionMessage(error) };
  }
}

export async function toggleNearbyVisibilityAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const dogId = stringValue(formData, "dogId");
  const enabled = checkboxValue(formData, "nearbyEnabled");

  if (!dogId) {
    return { status: "error", message: "Selecciona un perro." };
  }

  try {
    const { supabase, user } = await requireActionUser();
    const { data: dog } = await supabase
      .from("dogs")
      .select("id, owner_id")
      .eq("id", dogId)
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!dog) {
      throw new Error("No tienes permisos para este perro.");
    }

    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from("dog_locations")
        .update({
          nearby_enabled: enabled,
          updated_at: new Date().toISOString(),
        })
        .eq("dog_id", dogId);

      if (error) {
        throw new Error("No pudimos actualizar la visibilidad cercana.");
      }
    }

    revalidatePath("/nearby");
    revalidatePath("/match");
    return {
      status: "success",
      message: enabled ? "Visibilidad activada." : "Visibilidad desactivada.",
    };
  } catch (error) {
    return { status: "error", message: actionMessage(error) };
  }
}
