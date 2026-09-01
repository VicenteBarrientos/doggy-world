"use client";

import { LoaderCircle, PawPrint } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";

import { sendFriendRequestAction } from "@/app/actions/friendships";
import { Button, buttonStyles } from "@/components/ui/button";
import { FormStatus } from "@/components/ui/form-feedback";
import { initialActionState } from "@/lib/forms";
import type { DogWithPhoto } from "@/types/database";

export function FriendRequestForm({
  ownerDogs,
  recipientDogId,
  recipientName,
}: {
  ownerDogs: DogWithPhoto[];
  recipientDogId: string;
  recipientName: string;
}) {
  const [state, action, pending] = useActionState(sendFriendRequestAction, initialActionState);

  if (!ownerDogs.length) {
    return (
      <div className="rounded-[1.75rem] bg-surface-muted p-5">
        <p className="text-sm leading-6 text-ink-muted">Crea un pasaporte para poder enviar una solicitud a {recipientName}.</p>
        <Link href="/dogs/new" className={buttonStyles({ size: "sm", className: "mt-4" })}>Crear pasaporte</Link>
      </div>
    );
  }

  return (
    <form action={action} className="rounded-[1.75rem] bg-surface-muted p-5">
      <input type="hidden" name="recipientDogId" value={recipientDogId} />
      <label htmlFor="requesterDogId" className="text-sm font-semibold">¿Quién quiere ser su amigo?</label>
      <select id="requesterDogId" name="requesterDogId" className="mt-2 min-h-11 w-full rounded-full border border-line bg-white px-4">
        {ownerDogs.map((dog) => <option key={dog.id} value={dog.id}>{dog.name}</option>)}
      </select>
      <div className="mt-4"><FormStatus state={state} /></div>
      <Button type="submit" className="mt-4 w-full" disabled={pending || state.status === "success"}>
        {pending ? <LoaderCircle className="animate-spin" size={17} /> : <PawPrint size={17} />}
        {state.status === "success" ? "Solicitud enviada" : `Agregar a ${recipientName}`}
      </Button>
    </form>
  );
}
