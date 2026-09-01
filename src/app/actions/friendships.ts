"use server";

import { revalidatePath } from "next/cache";

import {
  actionMessage,
  requireActionUser,
  stringValue,
} from "@/lib/action-helpers";
import { fieldErrorsFromZod, type ActionState } from "@/lib/forms";
import { friendRequestSchema, friendshipResponseSchema } from "@/lib/validation";

export async function sendFriendRequestAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = friendRequestSchema.safeParse({
    requesterDogId: stringValue(formData, "requesterDogId"),
    recipientDogId: stringValue(formData, "recipientDogId"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Revisa la solicitud.",
      fieldErrors: fieldErrorsFromZod(parsed.error.flatten().fieldErrors),
    };
  }

  try {
    const { supabase, user } = await requireActionUser();
    const [{ data: requester }, { data: recipient }] = await Promise.all([
      supabase
        .from("dogs")
        .select("id")
        .eq("id", parsed.data.requesterDogId)
        .eq("owner_id", user.id)
        .maybeSingle(),
      supabase
        .from("dogs")
        .select("id, is_public")
        .eq("id", parsed.data.recipientDogId)
        .eq("is_public", true)
        .maybeSingle(),
    ]);
    if (!requester) throw new Error("Elige uno de tus perros.");
    if (!recipient) throw new Error("Este pasaporte ya no acepta solicitudes.");

    const { error } = await supabase.from("dog_friendships").insert({
      requester_dog_id: requester.id,
      recipient_dog_id: recipient.id,
      status: "pending",
    });
    if (error?.code === "23505") {
      throw new Error("Estos perros ya tienen una solicitud o amistad.");
    }
    if (error) throw new Error("No pudimos enviar la solicitud.");
  } catch (error) {
    return { status: "error", message: actionMessage(error) };
  }

  revalidatePath("/friend-requests");
  return { status: "success", message: "Solicitud enviada 🐾" };
}

export async function respondToFriendRequestAction(formData: FormData) {
  const parsed = friendshipResponseSchema.safeParse({
    friendshipId: stringValue(formData, "friendshipId"),
    status: stringValue(formData, "status"),
  });
  if (!parsed.success) return;

  const { supabase, user } = await requireActionUser();
  const { data: friendship } = await supabase
    .from("dog_friendships")
    .select("id, recipient_dog_id")
    .eq("id", parsed.data.friendshipId)
    .eq("status", "pending")
    .maybeSingle();
  if (!friendship) return;

  const { data: recipient } = await supabase
    .from("dogs")
    .select("id")
    .eq("id", friendship.recipient_dog_id)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!recipient) return;

  await supabase
    .from("dog_friendships")
    .update({ status: parsed.data.status, responded_at: new Date().toISOString() })
    .eq("id", parsed.data.friendshipId);
  revalidatePath("/friend-requests");
  revalidatePath("/dashboard");
}

export async function removeFriendshipAction(formData: FormData) {
  const friendshipId = stringValue(formData, "friendshipId");
  const dogId = stringValue(formData, "dogId");
  const { supabase, user } = await requireActionUser();
  const { data: friendship } = await supabase
    .from("dog_friendships")
    .select("*")
    .eq("id", friendshipId)
    .maybeSingle();
  if (!friendship) return;

  const { data: ownedDogs } = await supabase
    .from("dogs")
    .select("id")
    .eq("owner_id", user.id)
    .in("id", [friendship.requester_dog_id, friendship.recipient_dog_id]);
  if (!ownedDogs?.length) return;

  await supabase.from("dog_friendships").delete().eq("id", friendshipId);
  revalidatePath(`/dogs/${dogId}/friends`);
}
