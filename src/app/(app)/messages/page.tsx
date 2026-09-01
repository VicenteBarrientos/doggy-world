import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MessageCircle, MessageSquarePlus } from "lucide-react";

import { DogAvatar } from "@/components/dogs/dog-avatar";
import { getOwnerDogs } from "@/lib/data/dogs";
import { getDogConversations } from "@/lib/data/chat";
import { requireViewer } from "@/lib/data/viewer";

export const metadata: Metadata = {
  title: "Mensajes · Doggy World",
  description: "Conversaciones 1:1 con amigos caninos y matches.",
};

export default async function MessagesPage() {
  await requireViewer();
  const ownerDogs = await getOwnerDogs();

  if (ownerDogs.length === 0) {
    redirect("/dogs/new");
  }

  const activeDog = ownerDogs[0];
  const conversations = await getDogConversations(activeDog.id);

  return (
    <div className="space-y-6">
      <div>
        <span className="border border-ink bg-sun px-2 py-0.5 font-display text-[10px] uppercase tracking-widest text-ink shadow-[1px_1px_0_var(--ink)]">
          Bandeja de entrada
        </span>
        <h1 className="mt-2 font-display text-3xl uppercase tracking-tight text-ink sm:text-4xl">
          Mensajes
        </h1>
        <p className="mt-1 max-w-xl text-xs text-ink/75 sm:text-sm">
          Chatea directamente con dueños de perros amigos y matches confirmados de {activeDog.name}.
        </p>
      </div>

      {conversations.length === 0 ? (
        <div className="border-2 border-ink bg-white p-12 text-center shadow-[6px_6px_0_var(--ink)]">
          <div className="mx-auto flex size-14 items-center justify-center border-2 border-ink bg-sun text-ink shadow-[3px_3px_0_var(--ink)]">
            <MessageCircle size={28} />
          </div>
          <h3 className="mt-4 font-display text-xl uppercase tracking-tight text-ink">
            No tienes conversaciones aún
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-ink/75">
            Puedes chatear 1:1 con perros que sean tus amigos aceptados o con quienes hayas hecho match mutuo.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/match"
              className="border-2 border-ink bg-electric px-4 py-2 font-display text-xs uppercase tracking-wider text-white shadow-[2px_2px_0_var(--ink)] transition hover:bg-electric-hover"
            >
              Hacer Match 🐾
            </Link>
            <Link
              href="/discover"
              className="border-2 border-ink bg-white px-4 py-2 font-display text-xs uppercase tracking-wider text-ink shadow-[2px_2px_0_var(--ink)] transition hover:bg-cream-deep"
            >
              Explorar Amigos
            </Link>
          </div>
        </div>
      ) : (
        <div className="divide-y-2 divide-ink border-2 border-ink bg-white shadow-[6px_6px_0_var(--ink)]">
          {conversations.map((c) => (
            <Link
              key={c.id}
              href={`/messages/${c.id}`}
              className="flex items-center justify-between p-4 transition hover:bg-cream/60 sm:p-5"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <DogAvatar src={c.other_dog.photo_url} name={c.other_dog.name} size="md" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="truncate font-display text-base uppercase text-ink">
                      {c.other_dog.name}
                    </h4>
                    <span className="text-xs text-ink/60">· {c.other_dog.breed}</span>
                  </div>
                  <p className="truncate text-xs text-ink/75 mt-0.5">
                    {c.last_message ? c.last_message.body : "Conversación iniciada. Envía un saludo."}
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-right pl-3">
                <span className="font-mono text-[10px] text-ink/60">
                  {new Date(c.last_message_at).toLocaleDateString("es-CL", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
