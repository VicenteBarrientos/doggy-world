import type { Metadata } from "next";
import { ArrowLeft, Compass, Unlink, Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { removeFriendshipAction } from "@/app/actions/friendships";
import { DogCard } from "@/components/dogs/dog-card";
import { Button, buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getOwnerDog } from "@/lib/data/dogs";
import { getDogFriendConnections } from "@/lib/data/friendships";
import { requireViewer } from "@/lib/data/viewer";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Amigos" };

export default async function DogFriendsPage({ params }: Props) {
  const { id } = await params;
  const [data, connections, viewer] = await Promise.all([
    getOwnerDog(id),
    getDogFriendConnections(id),
    requireViewer(),
  ]);
  if (!data) notFound();

  return (
    <div>
      <Link href={`/dogs/${id}`} className={buttonStyles({ variant: "ghost", size: "sm", className: "-ml-3" })}><ArrowLeft size={16} /> Volver a {data.dog.name}</Link>
      <div className="mt-5 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">Su círculo</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Amigos de {data.dog.name}</h1>
          <p className="mt-4 text-base text-ink-muted">{connections.length} {connections.length === 1 ? "amistad conectada" : "amistades conectadas"} a su pasaporte.</p>
        </div>
        <Link href="/discover" className={buttonStyles()}><Compass size={17} /> Descubrir perros</Link>
      </div>
      {connections.length ? (
        <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {connections.map(({ friendship, friend }) => (
            <div key={friendship.id}>
              <DogCard dog={friend} publicView />
              {viewer.isDemo ? (
                <p className="mt-2 text-center text-xs text-ink-muted">Conecta Supabase para eliminar amistades</p>
              ) : (
                <form action={removeFriendshipAction} className="mt-2 flex justify-center">
                  <input type="hidden" name="friendshipId" value={friendship.id} />
                  <input type="hidden" name="dogId" value={id} />
                  <Button type="submit" variant="ghost" size="sm"><Unlink size={15} /> Eliminar amistad</Button>
                </form>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-9"><EmptyState icon={<Users size={26} />} title={`${data.dog.name} aún no tiene amigos conectados`} description="Explora pasaportes públicos y envía una solicitud desde el perfil del perro que ya conoce." action={<Link href="/discover" className={buttonStyles()}>Explorar pasaportes</Link>} /></div>
      )}
    </div>
  );
}
