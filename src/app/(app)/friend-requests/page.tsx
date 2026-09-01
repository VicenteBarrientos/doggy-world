import type { Metadata } from "next";
import { Ban, Check, Inbox, PawPrint, X } from "lucide-react";

import { respondToFriendRequestAction } from "@/app/actions/friendships";
import { DogAvatar } from "@/components/dogs/dog-avatar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getFriendRequests } from "@/lib/data/friendships";
import { requireViewer } from "@/lib/data/viewer";

export const metadata: Metadata = { title: "Solicitudes de amistad" };

export default async function FriendRequestsPage() {
  const [requests, viewer] = await Promise.all([getFriendRequests(), requireViewer()]);
  return (
    <div className="mx-auto max-w-4xl">
      <div className="max-w-2xl">
        <p className="font-brush text-3xl text-electric">Amigos</p>
        <h1 className="mt-1 text-4xl sm:text-6xl">Solicitudes pendientes</h1>
        <p className="mt-4 text-base leading-7 text-ink/75">
          Tú decides qué conexiones forman parte del mundo y la manada de tus perros.
        </p>
      </div>

      <div className="mt-10 space-y-5">
        {requests.map(({ friendship, requester, recipient }) => (
          <article key={friendship.id} className="edge-card p-6 shadow-[6px_6px_0_var(--ink)]">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4">
                <div className="border-2 border-ink bg-cream-deep">
                  <DogAvatar src={requester.photo_url} name={requester.name} size="lg" className="rounded-none" />
                </div>
                <div>
                  <p className="text-xs font-display uppercase tracking-wider text-ink/65">
                    <strong className="text-ink">{requester.name}</strong> quiere ser amigo de
                  </p>
                  <p className="mt-1 font-display text-2xl uppercase">
                    {recipient.name} <span aria-hidden="true">🐾</span>
                  </p>
                  <p className="mt-0.5 text-xs text-ink/70">
                    {requester.breed} · {requester.city ?? "Ciudad no indicada"}
                  </p>
                </div>
              </div>

              {viewer.isDemo ? (
                <div className="border-2 border-ink bg-sun px-3.5 py-2 text-center font-display text-xs uppercase shadow-[2px_2px_0_var(--ink)] text-ink">
                  Modo demo: Conecta Supabase para responder
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <form action={respondToFriendRequestAction}>
                    <input type="hidden" name="friendshipId" value={friendship.id} />
                    <input type="hidden" name="status" value="accepted" />
                    <Button type="submit" variant="primary" size="sm">
                      <Check size={16} /> Aceptar
                    </Button>
                  </form>
                  <form action={respondToFriendRequestAction}>
                    <input type="hidden" name="friendshipId" value={friendship.id} />
                    <input type="hidden" name="status" value="declined" />
                    <Button type="submit" variant="outline" size="sm">
                      <X size={16} /> Rechazar
                    </Button>
                  </form>
                  <form action={respondToFriendRequestAction}>
                    <input type="hidden" name="friendshipId" value={friendship.id} />
                    <input type="hidden" name="status" value="blocked" />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      aria-label={`Bloquear solicitudes de ${requester.name}`}
                    >
                      <Ban size={16} /> Bloquear
                    </Button>
                  </form>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>

      {!requests.length ? (
        <div className="mt-10">
          <EmptyState
            icon={<Inbox size={26} />}
            title="Todo al día"
            description="No hay solicitudes pendientes. Cuando otro perro quiera conectar, aparecerá aquí."
          />
        </div>
      ) : null}

      <div className="mt-10 border-2 border-ink bg-sun p-6 text-ink shadow-[4px_4px_0_var(--ink)]">
        <p className="flex items-center gap-2 font-display text-sm uppercase">
          <PawPrint size={18} /> Las amistades caninas son simétricas
        </p>
        <p className="mt-1.5 text-xs leading-5 text-ink/80">
          Cuando aceptas una solicitud, ambos pasaportes se muestran mutuamente como amigos.
          Cualquiera de los dos dueños puede pausar o eliminar la conexión en cualquier momento.
        </p>
      </div>
    </div>
  );
}
