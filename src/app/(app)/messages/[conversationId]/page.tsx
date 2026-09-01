import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ChatRoom } from "@/components/chat/chat-room";
import { getOwnerDogs } from "@/lib/data/dogs";
import { getConversationDetails } from "@/lib/data/chat";
import { requireViewer } from "@/lib/data/viewer";

type ConversationPageProps = {
  params: Promise<{ conversationId: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Conversación · Doggy World",
  };
}

export default async function ConversationPage({ params }: ConversationPageProps) {
  const { conversationId } = await params;
  await requireViewer();
  const ownerDogs = await getOwnerDogs();

  if (ownerDogs.length === 0) {
    redirect("/dogs/new");
  }

  const activeDog = ownerDogs[0];
  const details = await getConversationDetails(conversationId, activeDog.id);

  if (!details) {
    redirect("/messages");
  }

  return (
    <div>
      <ChatRoom
        conversationId={conversationId}
        activeDog={activeDog}
        otherDog={details.otherDog}
        initialMessages={details.messages}
      />
    </div>
  );
}
