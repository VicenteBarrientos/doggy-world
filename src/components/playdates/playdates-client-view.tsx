"use client";

import { useState, useTransition } from "react";
import {
  Calendar,
  Clock,
  LoaderCircle,
  MapPin,
  Plus,
  ShieldCheck,
  X,
} from "lucide-react";

import { createPlaydateAction, respondPlaydateInviteAction } from "@/app/actions/playdates";
import { DogAvatar } from "@/components/dogs/dog-avatar";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import type { DogWithPhoto, PlaydateWithDetails } from "@/types/database";

type PlaydatesClientViewProps = {
  activeDog: DogWithPhoto;
  allOwnerDogs: DogWithPhoto[];
  potentialPartners: DogWithPhoto[];
  upcoming: PlaydateWithDetails[];
  invitations: PlaydateWithDetails[];
  past: PlaydateWithDetails[];
};

export function PlaydatesClientView({
  activeDog,
  allOwnerDogs,
  potentialPartners,
  upcoming,
  invitations,
  past,
}: PlaydatesClientViewProps) {
  const [activeTab, setActiveTab] = useState<"upcoming" | "invitations" | "past">("upcoming");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formFeedback, setFormFeedback] = useState<{ status: "idle" | "error"; message?: string }>({
    status: "idle",
  });

  function handleCreateSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await createPlaydateAction({ status: "idle" }, fd);
      if (res.status === "error") {
        setFormFeedback({ status: "error", message: res.message });
      } else {
        track("playdate_created");
        setIsCreateModalOpen(false);
        setFormFeedback({ status: "idle" });
      }
    });
  }

  function handleRespond(playdateId: string, dogId: string, response: "accepted" | "declined") {
    const fd = new FormData();
    fd.set("playdateId", playdateId);
    fd.set("dogId", dogId);
    fd.set("response", response);

    startTransition(async () => {
      await respondPlaydateInviteAction({ status: "idle" }, fd);
      track(response === "accepted" ? "playdate_invite_accepted" : "playdate_invite_declined");
    });
  }

  return (
    <div className="space-y-6">
      {/* 1. SAFETY CALLOUT */}
      <div className="flex items-start gap-3 border-2 border-ink bg-sun/20 p-4 shadow-[4px_4px_0_var(--ink)]">
        <span className="flex size-9 shrink-0 items-center justify-center border-2 border-ink bg-sun text-ink shadow-[2px_2px_0_var(--ink)]">
          <ShieldCheck size={18} />
        </span>
        <div className="text-xs leading-5 text-ink/80">
          <p className="font-bold text-ink">Seguridad en los encuentros:</p>
          <p>
            Coordina siempre con el dueño en un lugar público y visible (parques caninos, plazas concurridas)
            y asegúrate de que ambos perros tengan sus vacunas al día.
          </p>
        </div>
      </div>

      {/* 2. TOP ACTION & TABS */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Tabs */}
        <div className="flex border-2 border-ink bg-white shadow-[3px_3px_0_var(--ink)]">
          <button
            type="button"
            onClick={() => setActiveTab("upcoming")}
            className={`flex items-center gap-1.5 px-4 py-2 font-display text-xs uppercase tracking-wider transition ${
              activeTab === "upcoming" ? "bg-ink text-white" : "text-ink hover:bg-cream"
            }`}
          >
            <span>Próximos</span>
            {upcoming.length > 0 ? (
              <span className="ml-1 border border-ink bg-sun px-1.5 py-0.2 text-[10px] text-ink">
                {upcoming.length}
              </span>
            ) : null}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("invitations")}
            className={`flex items-center gap-1.5 border-l-2 border-ink px-4 py-2 font-display text-xs uppercase tracking-wider transition ${
              activeTab === "invitations" ? "bg-ink text-white" : "text-ink hover:bg-cream"
            }`}
          >
            <span>Invitaciones</span>
            {invitations.length > 0 ? (
              <span className="ml-1 border border-ink bg-danger px-1.5 py-0.2 text-[10px] text-white">
                {invitations.length}
              </span>
            ) : null}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("past")}
            className={`flex items-center gap-1.5 border-l-2 border-ink px-4 py-2 font-display text-xs uppercase tracking-wider transition ${
              activeTab === "past" ? "bg-ink text-white" : "text-ink hover:bg-cream"
            }`}
          >
            <span>Pasados</span>
          </button>
        </div>

        {/* CTA */}
        <Button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="gap-2 self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Organizar Playdate</span>
        </Button>
      </div>

      {/* 3. TAB CONTENT */}
      {activeTab === "upcoming" ? (
        upcoming.length === 0 ? (
          <div className="border-2 border-ink bg-white p-10 text-center shadow-[4px_4px_0_var(--ink)]">
            <div className="mx-auto flex size-12 items-center justify-center border-2 border-ink bg-cream text-ink">
              <Calendar size={22} />
            </div>
            <h3 className="mt-3 font-display text-lg uppercase text-ink">No tienes playdates programados</h3>
            <p className="mt-1 text-xs text-ink/70">
              Invita a un amigo o a un perro compatible de Match a compartir un paseo.
            </p>
            <div className="mt-4">
              <Button type="button" size="sm" onClick={() => setIsCreateModalOpen(true)}>
                Organizar el primero
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {upcoming.map((p) => (
              <PlaydateCard key={p.id} playdate={p} activeDogId={activeDog.id} />
            ))}
          </div>
        )
      ) : activeTab === "invitations" ? (
        invitations.length === 0 ? (
          <div className="border-2 border-ink bg-white p-10 text-center shadow-[4px_4px_0_var(--ink)]">
            <p className="font-display text-sm uppercase text-ink/70">No tienes invitaciones pendientes</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {invitations.map((p) => (
              <div
                key={p.id}
                className="edge-card flex flex-col justify-between border-2 border-ink bg-white p-5 shadow-[5px_5px_0_var(--ink)]"
              >
                <div>
                  <span className="border border-ink bg-sun px-2 py-0.5 font-display text-[10px] uppercase text-ink">
                    Invitación para {activeDog.name}
                  </span>
                  <h4 className="mt-2 font-display text-xl uppercase text-ink">{p.title}</h4>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-ink/75">
                    <Clock size={13} /> {new Date(p.starts_at).toLocaleString("es-CL", { dateStyle: "full", timeStyle: "short" })}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-ink/75">
                    <MapPin size={13} /> {p.location_label}, {p.city}
                  </p>
                  <div className="mt-4 flex items-center gap-2 border-t border-ink/20 pt-3">
                    <DogAvatar src={p.host_dog.photo_url} name={p.host_dog.name} size="sm" />
                    <span className="text-xs">Organizado por <strong>{p.host_dog.name}</strong></span>
                  </div>
                </div>

                <div className="mt-5 flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRespond(p.id, activeDog.id, "declined")}
                    disabled={isPending}
                    className="w-1/2"
                  >
                    Declinar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleRespond(p.id, activeDog.id, "accepted")}
                    disabled={isPending}
                    className="w-1/2 bg-electric"
                  >
                    Aceptar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        past.length === 0 ? (
          <div className="border-2 border-ink bg-white p-10 text-center shadow-[4px_4px_0_var(--ink)]">
            <p className="font-display text-sm uppercase text-ink/70">No hay playdates pasados</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 opacity-80">
            {past.map((p) => (
              <PlaydateCard key={p.id} playdate={p} activeDogId={activeDog.id} />
            ))}
          </div>
        )
      )}

      {/* 4. MODAL ORGANIZAR PLAYDATE */}
      {isCreateModalOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/75 p-4 backdrop-blur-xs"
        >
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto border-2 border-ink bg-cream p-6 shadow-[8px_8px_0_var(--ink)] sm:p-8">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute right-4 top-4 flex size-8 items-center justify-center border-2 border-ink bg-white shadow-[2px_2px_0_var(--ink)] hover:bg-sun"
            >
              <X size={16} />
            </button>

            <div>
              <span className="border border-ink bg-sun px-2 py-0.5 font-display text-[10px] uppercase text-ink">
                Paseo canino
              </span>
              <h3 className="mt-2 font-display text-2xl uppercase tracking-tight text-ink">
                Organizar nuevo playdate
              </h3>
              <p className="mt-0.5 text-xs text-ink/70">
                Elige la fecha, el lugar público de encuentro y el perro invitado.
              </p>
            </div>

            {formFeedback.status === "error" ? (
              <p className="mt-3 text-xs font-semibold text-danger">{formFeedback.message}</p>
            ) : null}

            <form onSubmit={handleCreateSubmit} className="mt-5 space-y-4 text-left">
              {/* Host Dog */}
              <div>
                <label className="block font-display text-xs uppercase tracking-wider text-ink">
                  Tu perro anfitrión
                </label>
                <select
                  name="hostDogId"
                  defaultValue={activeDog.id}
                  className="mt-1.5 w-full border-2 border-ink bg-white p-2.5 text-xs font-bold text-ink shadow-[2px_2px_0_var(--ink)]"
                >
                  {allOwnerDogs.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.breed})
                    </option>
                  ))}
                </select>
              </div>

              {/* Invited Dog */}
              <div>
                <label className="block font-display text-xs uppercase tracking-wider text-ink">
                  Perro invitado
                </label>
                {potentialPartners.length > 0 ? (
                  <select
                    name="invitedDogId"
                    required
                    className="mt-1.5 w-full border-2 border-ink bg-white p-2.5 text-xs font-bold text-ink shadow-[2px_2px_0_var(--ink)]"
                  >
                    {potentialPartners.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.breed})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="mt-1 text-xs text-ink/70 italic">
                    Conecta primero con amigos o haz match para tener compañeros para invitar.
                  </p>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block font-display text-xs uppercase tracking-wider text-ink">
                  Título del encuentro
                </label>
                <input
                  name="title"
                  required
                  defaultValue="Paseo y juegos en el parque"
                  className="mt-1.5 w-full border-2 border-ink bg-white p-2.5 text-xs text-ink shadow-[2px_2px_0_var(--ink)]"
                  placeholder="Ej: Caminata matutina en el parque"
                />
              </div>

              {/* Starts at */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-display text-xs uppercase tracking-wider text-ink">
                    Fecha y hora
                  </label>
                  <input
                    type="datetime-local"
                    name="startsAt"
                    required
                    className="mt-1.5 w-full border-2 border-ink bg-white p-2 text-xs text-ink shadow-[2px_2px_0_var(--ink)]"
                  />
                </div>
                <div>
                  <label className="block font-display text-xs uppercase tracking-wider text-ink">
                    Ciudad
                  </label>
                  <input
                    name="city"
                    required
                    defaultValue={activeDog.city || "Santiago"}
                    className="mt-1.5 w-full border-2 border-ink bg-white p-2 text-xs text-ink shadow-[2px_2px_0_var(--ink)]"
                  />
                </div>
              </div>

              {/* Location label */}
              <div>
                <label className="block font-display text-xs uppercase tracking-wider text-ink">
                  Punto de encuentro público
                </label>
                <input
                  name="locationLabel"
                  required
                  placeholder="Ej: Parque Inés de Suárez, entrada Antonio Varas"
                  className="mt-1.5 w-full border-2 border-ink bg-white p-2.5 text-xs text-ink shadow-[2px_2px_0_var(--ink)]"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block font-display text-xs uppercase tracking-wider text-ink">
                  Notas o qué llevar (opcional)
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="Ej: Llevaremos pelota y cuerda. Si tu perro es selectivo con juguetes, avísanos."
                  className="mt-1.5 w-full border-2 border-ink bg-white p-2.5 text-xs text-ink shadow-[2px_2px_0_var(--ink)]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isPending || potentialPartners.length === 0}
                  className="gap-1.5"
                >
                  {isPending ? <LoaderCircle className="animate-spin" size={15} /> : null}
                  <span>Enviar invitación</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PlaydateCard({
  playdate,
  activeDogId,
}: {
  playdate: PlaydateWithDetails;
  activeDogId: string;
}) {
  const isHost = playdate.host_dog_id === activeDogId;

  return (
    <div className="edge-card flex flex-col justify-between border-2 border-ink bg-white p-5 shadow-[5px_5px_0_var(--ink)]">
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="border border-ink bg-cream-deep px-2 py-0.5 font-display text-[10px] uppercase text-ink">
            {isHost ? "Eres anfitrión" : "Confirmado"}
          </span>
          <span className="font-display text-[10px] uppercase text-ink/70">
            {playdate.status === "scheduled" ? "Programado" : playdate.status}
          </span>
        </div>

        <h4 className="mt-2 font-display text-xl uppercase text-ink">{playdate.title}</h4>

        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-ink/80">
          <Clock size={13} className="text-electric" />
          <span>
            {new Date(playdate.starts_at).toLocaleString("es-CL", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
        </p>

        <p className="mt-1 flex items-center gap-1.5 text-xs text-ink/80">
          <MapPin size={13} className="text-electric" />
          <span>
            {playdate.location_label}, {playdate.city}
          </span>
        </p>

        {playdate.notes ? (
          <p className="mt-3 border-t border-ink/20 pt-2 text-xs italic text-ink/70">
            “{playdate.notes}”
          </p>
        ) : null}

        {/* Participants avatars */}
        <div className="mt-4 flex items-center gap-3 border-t border-ink/20 pt-3">
          <div className="flex items-center gap-1.5">
            <DogAvatar src={playdate.host_dog.photo_url} name={playdate.host_dog.name} size="sm" />
            <span className="font-display text-xs text-ink">{playdate.host_dog.name}</span>
          </div>

          <span className="text-xs text-ink/40">+</span>

          {playdate.participants.map((pt) => (
            <div key={pt.id} className="flex items-center gap-1.5">
              <DogAvatar src={pt.dog.photo_url} name={pt.dog.name} size="sm" />
              <span className="font-display text-xs text-ink">{pt.dog.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
