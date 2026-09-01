"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { actionMessage, requireActionUser, stringValue } from "@/lib/action-helpers";
import { getViewer } from "@/lib/data/viewer";
import { demoDogs } from "@/lib/demo-data";
import { type ActionState } from "@/lib/forms";
import { recordDemoMatchAction } from "@/lib/data/matching";

const matchActionSchema = z.object({
  fromDogId: z.string().uuid("Selecciona tu perro."),
  toDogId: z.string().uuid("Candidato inválido."),
  action: z.enum(["like", "pass"]),
});

export type MatchActionResult = ActionState & {
  isMutualMatch?: boolean;
};

export async function recordMatchAction(
  _prevState: MatchActionResult,
  formData: FormData,
): Promise<MatchActionResult> {
  const parsed = matchActionSchema.safeParse({
    fromDogId: stringValue(formData, "fromDogId"),
    toDogId: stringValue(formData, "toDogId"),
    action: stringValue(formData, "action"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Acción inválida.",
    };
  }

  if (parsed.data.fromDogId === parsed.data.toDogId) {
    return {
      status: "error",
      message: "Un perro no puede hacer match consigo mismo.",
    };
  }

  try {
    const viewer = await getViewer();

    if (viewer?.isDemo) {
      const ownedDog = demoDogs.find(
        (dog) => dog.id === parsed.data.fromDogId && dog.owner_id === viewer.id,
      );
      const candidate = demoDogs.find(
        (dog) => dog.id === parsed.data.toDogId && dog.is_public,
      );

      if (!ownedDog) {
        return { status: "error", message: "Elige uno de tus perros demo." };
      }
      if (!candidate || candidate.owner_id === viewer.id) {
        return { status: "error", message: "Este candidato demo ya no está disponible." };
      }

      const isMutualMatch = recordDemoMatchAction(
        parsed.data.fromDogId,
        parsed.data.toDogId,
        parsed.data.action,
      );

      return {
        status: "success",
        message: isMutualMatch ? "¡Hicieron Match!" : "Decisión registrada.",
        isMutualMatch,
      };
    }

    const { supabase, user } = await requireActionUser();

    // Verify ownership
    const { data: dog } = await supabase
      .from("dogs")
      .select("id, owner_id")
      .eq("id", parsed.data.fromDogId)
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!dog) {
      throw new Error("No tienes permisos para actuar con este perro.");
    }

    let isMutualMatch = false;
    const { error } = await supabase.from("dog_match_actions").upsert(
      {
        from_dog_id: parsed.data.fromDogId,
        to_dog_id: parsed.data.toDogId,
        action: parsed.data.action,
      },
      { onConflict: "from_dog_id,to_dog_id" },
    );

    if (error) {
      console.error("[Match Action Error]", error);
      throw new Error("No pudimos registrar tu decisión.");
    }

    if (parsed.data.action === "like") {
      const dogA =
        parsed.data.fromDogId < parsed.data.toDogId
          ? parsed.data.fromDogId
          : parsed.data.toDogId;
      const dogB =
        parsed.data.fromDogId < parsed.data.toDogId
          ? parsed.data.toDogId
          : parsed.data.fromDogId;

      const { data: match } = await supabase
        .from("dog_matches")
        .select("id")
        .eq("dog_a_id", dogA)
        .eq("dog_b_id", dogB)
        .eq("status", "active")
        .maybeSingle();

      isMutualMatch = Boolean(match);
    }

    revalidatePath("/match");
    revalidatePath("/nearby");
    return {
      status: "success",
      message: isMutualMatch ? "¡Hicieron Match!" : "Decisión registrada.",
      isMutualMatch,
    };
  } catch (error) {
    return { status: "error", message: actionMessage(error) };
  }
}
