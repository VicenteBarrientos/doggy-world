"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, LoaderCircle, Send } from "lucide-react";

import { sendMessageAction } from "@/app/actions/chat";
import { DogAvatar } from "@/components/dogs/dog-avatar";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { createClient } from "@/lib/supabase/client";
import type { DogMessage, DogWithPhoto } from "@/types/database";

type ChatRoomProps = {
  conversationId: string;
  activeDog: DogWithPhoto;
  otherDog: DogWithPhoto;
  initialMessages: DogMessage[];
};

export function ChatRoom({
  conversationId,
  activeDog,
  otherDog,
  initialMessages,
}: ChatRoomProps) {
  const [messages, setMessages] = useState<DogMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "dog_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as DogMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text || isPending) return;

    setErrorMsg(null);
    setInputValue("");

    // Optimistic message
    const optimisticMsg: DogMessage = {
      id: `opt-${Date.now()}`,
      conversation_id: conversationId,
      sender_dog_id: activeDog.id,
      body: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    const fd = new FormData();
    fd.set("conversationId", conversationId);
    fd.set("senderDogId", activeDog.id);
    fd.set("body", text);

    startTransition(async () => {
      const res = await sendMessageAction({ status: "idle" }, fd);
      if (res.status === "error") {
        setErrorMsg(res.message ?? "Error al enviar mensaje");
        // Revert optimistic msg
        setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
      } else {
        track("message_sent");
      }
    });
  }

  return (
    <div className="flex h-[75vh] min-h-[500px] flex-col border-2 border-ink bg-white shadow-[6px_6px_0_var(--ink)]">
      {/* 1. CHAT HEADER */}
      <div className="flex items-center justify-between border-b-2 border-ink bg-cream p-3.5 sm:px-5">
        <div className="flex items-center gap-3">
          <Link
            href="/messages"
            className="flex size-8 items-center justify-center border-2 border-ink bg-white shadow-[2px_2px_0_var(--ink)] transition hover:bg-cream-deep"
            title="Volver a mensajes"
          >
            <ArrowLeft size={16} />
          </Link>

          <DogAvatar src={otherDog.photo_url} name={otherDog.name} size="sm" />

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base uppercase text-ink">{otherDog.name}</h3>
              <span className="border border-ink bg-sun px-1.5 py-0.2 font-display text-[9px] uppercase text-ink">
                1:1
              </span>
            </div>
            <p className="text-[11px] text-ink/70">{otherDog.breed}</p>
          </div>
        </div>

        <Link
          href={`/dog/${otherDog.slug}`}
          className="border-2 border-ink bg-white px-3 py-1 font-display text-xs uppercase tracking-wider text-ink shadow-[2px_2px_0_var(--ink)] transition hover:bg-cream-deep"
        >
          Ver Pasaporte
        </Link>
      </div>

      {/* 2. MESSAGES FEED */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-cream-deep/40">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center p-6">
            <div>
              <p className="font-display text-sm uppercase text-ink">Comienza la conversación</p>
              <p className="mt-1 text-xs text-ink/70">
                Saluda a {otherDog.name} y coordinen un encuentro o intercambien consejos.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_dog_id === activeDog.id;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[80%] border-2 border-ink p-3 shadow-[3px_3px_0_var(--ink)] ${
                    isMe
                      ? "bg-electric text-white"
                      : "bg-white text-ink"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words text-xs sm:text-sm font-medium leading-relaxed">
                    {msg.body}
                  </p>
                </div>
                <span className="mt-1 font-mono text-[10px] text-ink/60">
                  {new Date(msg.created_at).toLocaleTimeString("es-CL", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. INPUT FORM */}
      <div className="border-t-2 border-ink bg-white p-3 sm:p-4">
        {errorMsg ? (
          <p className="mb-2 text-xs font-bold text-danger">{errorMsg}</p>
        ) : null}

        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Escribe un mensaje para ${otherDog.name}…`}
            maxLength={1000}
            className="flex-1 border-2 border-ink bg-cream px-3 py-2 text-xs sm:text-sm text-ink shadow-[2px_2px_0_var(--ink)] focus:bg-white focus:outline-none"
          />

          <Button
            type="submit"
            disabled={!inputValue.trim() || isPending}
            className="gap-1.5 px-4"
          >
            {isPending ? (
              <LoaderCircle className="animate-spin" size={15} />
            ) : (
              <Send size={15} />
            )}
            <span className="hidden sm:inline">Enviar</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
