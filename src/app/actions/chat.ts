"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { actionMessage, requireActionUser, stringValue } from "@/lib/action-helpers";
import { type ActionState } from "@/lib/forms";
import { getOrCreateDemoConversation, recordDemoMessage } from "@/lib/data/chat";
import { getViewer } from "@/lib/data/viewer";
import { demoDogs } from "@/lib/demo-data";

const sendMessageSchema = z.object({
  conversationId: z.string().uuid("Conversación inválida."),
  senderDogId: z.string().uuid("Emisor inválido."),
  body: z
    .string()
    .trim()
    .min(1, "El mensaje no puede estar vacío.")
    .max(1000, "El mensaje no puede exceder 1000 caracteres."),
});

export async function sendMessageAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = sendMessageSchema.safeParse({
    conversationId: stringValue(formData, "conversationId"),
    senderDogId: stringValue(formData, "senderDogId"),
    body: stringValue(formData, "body"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Mensaje inválido.",
    };
  }

  try {
    const viewer = await getViewer();
    if (viewer?.isDemo) {
      const sender = demoDogs.find(
        (dog) => dog.id === parsed.data.senderDogId && dog.owner_id === viewer.id,
      );
      if (!sender) {
        return { status: "error", message: "Elige uno de tus perros demo como emisor." };
      }

      const message = recordDemoMessage(
        parsed.data.conversationId,
        parsed.data.senderDogId,
        parsed.data.body,
      );
      if (!message) {
        return { status: "error", message: "La conversación demo ya no está disponible." };
      }

      revalidatePath(`/messages/${parsed.data.conversationId}`);
      revalidatePath("/messages");
      return { status: "success", message: "Mensaje demo enviado." };
    }

    const { supabase, user } = await requireActionUser();

    // Verify sender dog ownership
    const { data: dog } = await supabase
      .from("dogs")
      .select("id, owner_id")
      .eq("id", parsed.data.senderDogId)
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!dog) {
      throw new Error("No tienes permisos para enviar mensajes desde este perro.");
    }

    const { error: msgErr } = await supabase.from("dog_messages").insert({
      conversation_id: parsed.data.conversationId,
      sender_dog_id: parsed.data.senderDogId,
      body: parsed.data.body,
    });

    if (msgErr) {
      console.error("[Send Message Error]", msgErr);
      throw new Error("No pudimos enviar tu mensaje. Asegúrate de tener una amistad o match activo.");
    }

    await supabase
      .from("dog_conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", parsed.data.conversationId);

    revalidatePath(`/messages/${parsed.data.conversationId}`);
    revalidatePath("/messages");
    return { status: "success", message: "Mensaje enviado." };
  } catch (error) {
    return { status: "error", message: actionMessage(error) };
  }
}

export async function startConversationAction(
  userDogId: string,
  otherDogId: string,
): Promise<{ success: boolean; conversationId?: string; message?: string }> {
  try {
    if (userDogId === otherDogId) {
      return { success: false, message: "Un perro no puede conversar consigo mismo." };
    }

    const viewer = await getViewer();
    if (viewer?.isDemo) {
      const userDog = demoDogs.find(
        (dog) => dog.id === userDogId && dog.owner_id === viewer.id,
      );
      const otherDog = demoDogs.find(
        (dog) => dog.id === otherDogId && dog.is_public,
      );

      if (!userDog) {
        return { success: false, message: "Elige uno de tus perros demo." };
      }
      if (!otherDog || otherDog.owner_id === viewer.id) {
        return { success: false, message: "Este perro demo no está disponible." };
      }

      const conversation = getOrCreateDemoConversation(userDog.id, otherDog.id);
      return { success: true, conversationId: conversation.id };
    }

    const { supabase, user } = await requireActionUser();

    // Verify user owns userDogId
    const { data: dog } = await supabase
      .from("dogs")
      .select("id, owner_id")
      .eq("id", userDogId)
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!dog) {
      return { success: false, message: "No tienes permisos para este perro." };
    }

    const a = userDogId < otherDogId ? userDogId : otherDogId;
    const b = userDogId < otherDogId ? otherDogId : userDogId;

    // Check if conversation already exists
    const { data: existing } = await supabase
      .from("dog_conversations")
      .select("id")
      .eq("dog_a_id", a)
      .eq("dog_b_id", b)
      .maybeSingle();

    if (existing) {
      return { success: true, conversationId: existing.id };
    }

    const { data: created, error } = await supabase
      .from("dog_conversations")
      .insert({
        dog_a_id: a,
        dog_b_id: b,
      })
      .select("id")
      .single();

    if (error || !created) {
      console.error("[Create Conversation Error]", error);
      return {
        success: false,
        message: "No se pudo iniciar la conversación. Verifica que sean amigos o hayan hecho match.",
      };
    }

    return { success: true, conversationId: created.id };
  } catch (err) {
    return { success: false, message: actionMessage(err) };
  }
}
