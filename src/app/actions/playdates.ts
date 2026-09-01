"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { actionMessage, requireActionUser, stringValue } from "@/lib/action-helpers";
import { type ActionState } from "@/lib/forms";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { recordDemoPlaydate, respondDemoPlaydate } from "@/lib/data/playdates";
import { demoDogs } from "@/lib/demo-data";

const createPlaydateSchema = z.object({
  hostDogId: z.string().uuid("Selecciona tu perro."),
  invitedDogId: z.string().uuid("Selecciona un perro invitado."),
  title: z
    .string()
    .trim()
    .min(3, "Ingresa un título de al menos 3 caracteres.")
    .max(100, "El título es demasiado largo."),
  startsAt: z.string().min(1, "Selecciona fecha y hora."),
  city: z.string().trim().min(2, "Ingresa la ciudad.").max(80),
  locationLabel: z
    .string()
    .trim()
    .min(3, "Ingresa el lugar de encuentro (ej. Parque Inés de Suárez).")
    .max(120),
  notes: z.string().trim().max(400).optional().nullable(),
});

export async function createPlaydateAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = createPlaydateSchema.safeParse({
    hostDogId: stringValue(formData, "hostDogId"),
    invitedDogId: stringValue(formData, "invitedDogId"),
    title: stringValue(formData, "title"),
    startsAt: stringValue(formData, "startsAt"),
    city: stringValue(formData, "city"),
    locationLabel: stringValue(formData, "locationLabel"),
    notes: stringValue(formData, "notes") || null,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Revisa los datos del playdate.",
    };
  }

  if (parsed.data.hostDogId === parsed.data.invitedDogId) {
    return {
      status: "error",
      message: "No puedes crear un playdate con el mismo perro.",
    };
  }

  try {
    const { supabase, user } = await requireActionUser();

    // Verify ownership of host dog
    const { data: hostDog } = await supabase
      .from("dogs")
      .select("id, owner_id")
      .eq("id", parsed.data.hostDogId)
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!hostDog) {
      throw new Error("No tienes permisos para organizar un playdate con este perro.");
    }

    if (isSupabaseConfigured()) {
      const { data: newPlaydate, error: pErr } = await supabase
        .from("playdates")
        .insert({
          host_dog_id: parsed.data.hostDogId,
          title: parsed.data.title,
          starts_at: new Date(parsed.data.startsAt).toISOString(),
          city: parsed.data.city,
          location_label: parsed.data.locationLabel,
          notes: parsed.data.notes,
          status: "scheduled",
        })
        .select("id")
        .single();

      if (pErr || !newPlaydate) {
        console.error("[Create Playdate Error]", pErr);
        throw new Error("No pudimos crear el playdate.");
      }

      const { error: partErr } = await supabase.from("playdate_participants").insert({
        playdate_id: newPlaydate.id,
        dog_id: parsed.data.invitedDogId,
        status: "invited",
      });

      if (partErr) {
        console.error("[Playdate Participant Error]", partErr);
        throw new Error("No pudimos enviar la invitación al playdate.");
      }
    } else {
      const host = demoDogs.find((d) => d.id === parsed.data.hostDogId) || demoDogs[0];
      const guest = demoDogs.find((d) => d.id === parsed.data.invitedDogId) || demoDogs[1];
      const newId = `demo-p-${Date.now()}`;
      recordDemoPlaydate({
        id: newId,
        host_dog_id: host.id,
        title: parsed.data.title,
        starts_at: new Date(parsed.data.startsAt).toISOString(),
        ends_at: null,
        city: parsed.data.city,
        location_label: parsed.data.locationLabel,
        meeting_point: null,
        notes: parsed.data.notes,
        status: "scheduled",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        host_dog: host,
        participants: [
          {
            id: `demo-pt-${Date.now()}`,
            playdate_id: newId,
            dog_id: guest.id,
            status: "invited",
            invited_at: new Date().toISOString(),
            responded_at: null,
            dog: guest,
          },
        ],
      });
    }

    revalidatePath("/playdates");
    return {
      status: "success",
      message: "¡Playdate organizado e invitación enviada!",
    };
  } catch (error) {
    return { status: "error", message: actionMessage(error) };
  }
}

export async function respondPlaydateInviteAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const playdateId = stringValue(formData, "playdateId");
  const dogId = stringValue(formData, "dogId");
  const response = stringValue(formData, "response") as "accepted" | "declined";

  if (!playdateId || !dogId || !["accepted", "declined"].includes(response)) {
    return { status: "error", message: "Respuesta inválida." };
  }

  try {
    const { supabase, user } = await requireActionUser();

    // Verify ownership of the invited dog
    const { data: dog } = await supabase
      .from("dogs")
      .select("id, owner_id")
      .eq("id", dogId)
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!dog) {
      throw new Error("No tienes permisos para responder por este perro.");
    }

    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from("playdate_participants")
        .update({
          status: response,
          responded_at: new Date().toISOString(),
        })
        .eq("playdate_id", playdateId)
        .eq("dog_id", dogId);

      if (error) {
        throw new Error("No pudimos actualizar la respuesta.");
      }
    } else {
      respondDemoPlaydate(playdateId, dogId, response);
    }

    revalidatePath("/playdates");
    return {
      status: "success",
      message: response === "accepted" ? "¡Invitación aceptada!" : "Invitación declinada.",
    };
  } catch (error) {
    return { status: "error", message: actionMessage(error) };
  }
}
