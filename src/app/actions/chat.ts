"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { actionMessage, requireActionUser, stringValue } from "@/lib/action-helpers";
import { type ActionState } from "@/lib/forms";
import { getOrCreateDemoConversation, recordDemoMessage } from "@/lib/data/chat";
import { isSupabaseConfigured } from "@/lib/supabase/config";

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

    if (isSupabaseConfigured()) {
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
    } else {
      recordDemoMessage(
        parsed.data.conversationId,
        parsed.data.senderDogId,
        parsed.data.body,
      );
    }

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

    if (isSupabaseConfigured()) {
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
    } else {
      const conv = getOrCreateDemoConversation(a, b);
      return { success: true, conversationId: conv.id };
    }
  } catch (err) {
    return { success: false, message: actionMessage(err) };
  }
}
