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
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">Amigos</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Solicitudes pendientes</h1>
        <p className="mt-4 text-base leading-7 text-ink-muted">Tú decides qué conexiones forman parte del mundo de tus perros.</p>
      </div>
      <div className="mt-9 space-y-4">
        {requests.map(({ friendship, requester, recipient }) => (
          <article key={friendship.id} className="rounded-[2rem] border border-line bg-white p-5 shadow-card sm:p-6">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4">
                <DogAvatar src={requester.photo_url} name={requester.name} size="lg" />
                <div>
                  <p className="text-sm text-ink-muted"><strong className="text-ink">{requester.name}</strong> quiere ser amigo de</p>
                  <p className="mt-1 font-display text-2xl font-semibold">{recipient.name} <span aria-hidden="true">🐾</span></p>
                  <p className="mt-1 text-xs text-ink-muted">{requester.breed} · {requester.city ?? "Ciudad no indicada"}</p>
                </div>
              </div>
              {viewer.isDemo ? (
                <div className="rounded-2xl bg-surface-muted px-4 py-3 text-center text-xs text-ink-muted">Conecta Supabase para responder</div>
              ) : (
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <form action={respondToFriendRequestAction}>
                    <input type="hidden" name="friendshipId" value={friendship.id} />
                    <input type="hidden" name="status" value="accepted" />
                    <Button type="submit" size="sm"><Check size={16} /> Aceptar</Button>
                  </form>
                  <form action={respondToFriendRequestAction}>
                    <input type="hidden" name="friendshipId" value={friendship.id} />
                    <input type="hidden" name="status" value="declined" />
                    <Button type="submit" variant="secondary" size="sm"><X size={16} /> Rechazar</Button>
                  </form>
                  <form action={respondToFriendRequestAction}>
                    <input type="hidden" name="friendshipId" value={friendship.id} />
                    <input type="hidden" name="status" value="blocked" />
                    <Button type="submit" variant="ghost" size="sm" aria-label={`Bloquear solicitudes de ${requester.name}`}><Ban size={16} /> Bloquear</Button>
                  </form>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
      {!requests.length ? <div className="mt-9"><EmptyState icon={<Inbox size={26} />} title="Todo al día" description="No hay solicitudes pendientes. Cuando otro perro quiera conectar, aparecerá aquí." /></div> : null}
      <div className="mt-8 rounded-[2rem] bg-brand-soft p-5 text-sm leading-6 text-brand-strong"><p className="flex items-center gap-2 font-semibold"><PawPrint size={17} /> Las amistades son simétricas</p><p className="mt-1 opacity-80">Cuando aceptas, ambos pasaportes se muestran mutuamente como amigos. Cualquiera de los dos dueños puede eliminar la conexión después.</p></div>
    </div>
  );
}
