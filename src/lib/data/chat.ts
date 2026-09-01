import "server-only";

import { resolveDogPhoto } from "@/lib/data/photos";
import { requireViewer } from "@/lib/data/viewer";
import { demoDogs } from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { ConversationListItem, DogMessage, DogWithPhoto } from "@/types/database";

// Demo in-memory messages store
const demoConversations: {
  id: string;
  dog_a_id: string;
  dog_b_id: string;
  created_at: string;
  last_message_at: string;
}[] = [
  {
    id: "c1111111-1111-4111-8111-111111111111",
    dog_a_id: demoDogs[0].id, // Rocky
    dog_b_id: demoDogs[2].id, // Coco
    created_at: "2026-08-20T14:00:00.000Z",
    last_message_at: "2026-08-20T14:30:00.000Z",
  },
];

const demoMessages: DogMessage[] = [
  {
    id: "m1111111-1111-4111-8111-111111111111",
    conversation_id: "c1111111-1111-4111-8111-111111111111",
    sender_dog_id: demoDogs[2].id, // Coco
    body: "¡Hola Rocky! Vi tu pasaporte, ¿sueles ir al parque los fines de semana?",
    created_at: "2026-08-20T14:00:00.000Z",
  },
  {
    id: "m2222222-2222-4222-8222-222222222222",
    conversation_id: "c1111111-1111-4111-8111-111111111111",
    sender_dog_id: demoDogs[0].id, // Rocky
    body: "¡Hola Coco! Sí, los sábados por la mañana corremos en el Parque Inés de Suárez.",
    created_at: "2026-08-20T14:30:00.000Z",
  },
];

export function recordDemoMessage(
  conversationId: string,
  senderDogId: string,
  body: string,
): DogMessage | null {
  const conv = demoConversations.find(
    (conversation) =>
      conversation.id === conversationId &&
      (conversation.dog_a_id === senderDogId || conversation.dog_b_id === senderDogId),
  );
  if (!conv) return null;

  const msg: DogMessage = {
    id: crypto.randomUUID(),
    conversation_id: conversationId,
    sender_dog_id: senderDogId,
    body,
    created_at: new Date().toISOString(),
  };
  demoMessages.push(msg);

  conv.last_message_at = msg.created_at;
  return msg;
}

export function getOrCreateDemoConversation(dogAId: string, dogBId: string) {
  const a = dogAId < dogBId ? dogAId : dogBId;
  const b = dogAId < dogBId ? dogBId : dogAId;

  let conv = demoConversations.find((c) => c.dog_a_id === a && c.dog_b_id === b);
  if (!conv) {
    conv = {
      id: crypto.randomUUID(),
      dog_a_id: a,
      dog_b_id: b,
      created_at: new Date().toISOString(),
      last_message_at: new Date().toISOString(),
    };
    demoConversations.push(conv);
  }
  return conv;
}

export async function getDogConversations(dogId: string): Promise<ConversationListItem[]> {
  const viewer = await requireViewer();

  if (viewer.isDemo || !isSupabaseConfigured()) {
    const list: ConversationListItem[] = [];
    for (const c of demoConversations) {
      if (c.dog_a_id !== dogId && c.dog_b_id !== dogId) continue;

      const otherDogId = c.dog_a_id === dogId ? c.dog_b_id : c.dog_a_id;
      const otherDog = demoDogs.find((d) => d.id === otherDogId);
      if (!otherDog) continue;

      const msgs = demoMessages.filter((m) => m.conversation_id === c.id);
      const lastMsg = msgs[msgs.length - 1] ?? null;

      list.push({
        ...c,
        other_dog: otherDog,
        last_message: lastMsg,
      });
    }

    return list.sort(
      (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime(),
    );
  }

  const supabase = await createClient();

  const { data: convs } = await supabase
    .from("dog_conversations")
    .select("*")
    .or(`dog_a_id.eq.${dogId},dog_b_id.eq.${dogId}`)
    .order("last_message_at", { ascending: false });

  if (!convs || convs.length === 0) return [];

  const otherDogIds = convs.map((c) => (c.dog_a_id === dogId ? c.dog_b_id : c.dog_a_id));
  const { data: dogs } = await supabase.from("dogs").select("*").in("id", otherDogIds);

  const dogMap = new Map<string, DogWithPhoto>();
  for (const d of dogs || []) {
    dogMap.set(d.id, { ...d, photo_url: await resolveDogPhoto(d.photo_path) });
  }

  const convIds = convs.map((c) => c.id);
  const { data: messages } = await supabase
    .from("dog_messages")
    .select("*")
    .in("conversation_id", convIds)
    .order("created_at", { ascending: false });

  const lastMsgMap = new Map<string, DogMessage>();
  for (const m of messages || []) {
    if (!lastMsgMap.has(m.conversation_id)) {
      lastMsgMap.set(m.conversation_id, m);
    }
  }

  const result: ConversationListItem[] = [];
  for (const c of convs) {
    const otherDogId = c.dog_a_id === dogId ? c.dog_b_id : c.dog_a_id;
    const otherDog = dogMap.get(otherDogId);
    if (!otherDog) continue;

    result.push({
      ...c,
      other_dog: otherDog,
      last_message: lastMsgMap.get(c.id) ?? null,
    });
  }

  return result;
}

export async function getConversationDetails(
  conversationId: string,
  userDogId: string,
): Promise<{
  conversation: { id: string; dog_a_id: string; dog_b_id: string };
  otherDog: DogWithPhoto;
  messages: DogMessage[];
} | null> {
  const viewer = await requireViewer();

  if (viewer.isDemo || !isSupabaseConfigured()) {
    const conv = demoConversations.find((c) => c.id === conversationId);
    if (!conv) return null;
    if (conv.dog_a_id !== userDogId && conv.dog_b_id !== userDogId) return null;

    const otherDogId = conv.dog_a_id === userDogId ? conv.dog_b_id : conv.dog_a_id;
    const otherDog = demoDogs.find((d) => d.id === otherDogId);
    if (!otherDog) return null;

    const msgs = demoMessages.filter((m) => m.conversation_id === conversationId);
    return { conversation: conv, otherDog, messages: msgs };
  }

  const supabase = await createClient();

  const { data: conv } = await supabase
    .from("dog_conversations")
    .select("*")
    .eq("id", conversationId)
    .maybeSingle();

  if (!conv) return null;
  if (conv.dog_a_id !== userDogId && conv.dog_b_id !== userDogId) return null;

  const otherDogId = conv.dog_a_id === userDogId ? conv.dog_b_id : conv.dog_a_id;
  const { data: otherDogRow } = await supabase
    .from("dogs")
    .select("*")
    .eq("id", otherDogId)
    .single();

  if (!otherDogRow) return null;

  const otherDog: DogWithPhoto = {
    ...otherDogRow,
    photo_url: await resolveDogPhoto(otherDogRow.photo_path),
  };

  const { data: messages } = await supabase
    .from("dog_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  return {
    conversation: conv,
    otherDog,
    messages: messages || [],
  };
}
