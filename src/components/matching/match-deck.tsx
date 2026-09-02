"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Heart,
  LoaderCircle,
  MapPin,
  MessageCircle,
  PawPrint,
  Sparkles,
  Users,
  X,
  Zap,
} from "lucide-react";

import { recordMatchAction } from "@/app/actions/matching";
import { DogAvatar } from "@/components/dogs/dog-avatar";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { formatAge, formatApproxDistance, personalityLabel, sexLabel } from "@/lib/utils";
import type { DogWithPhoto, MatchCandidateDog } from "@/types/database";

type MatchDeckProps = {
  activeDog: DogWithPhoto;
  initialCandidates: MatchCandidateDog[];
};

export function MatchDeck({ activeDog, initialCandidates }: MatchDeckProps) {
  const candidates = initialCandidates;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mutualMatchDog, setMutualMatchDog] = useState<MatchCandidateDog | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const submittingRef = useRef(false);

  const currentCandidate = candidates[currentIndex];
  const currentSex = sexLabel(currentCandidate?.sex);
  const currentDistance = formatApproxDistance(currentCandidate?.approx_distance_km);
  const locationLabel = [currentCandidate?.city, currentDistance].filter(Boolean).join(" · ");

  function handleAction(action: "like" | "pass") {
    if (!currentCandidate || isPending || submittingRef.current) return;

    const candidate = currentCandidate;
    submittingRef.current = true;
    setActionError(null);

    const fd = new FormData();
    fd.set("fromDogId", activeDog.id);
    fd.set("toDogId", candidate.id);
    fd.set("action", action);

    startTransition(async () => {
      try {
        const result = await recordMatchAction({ status: "idle" }, fd);
        if (result.status !== "success") {
          setActionError(
            result.message ?? "No pudimos registrar tu decisión. Inténtalo nuevamente.",
          );
          return;
        }

        track(action === "like" ? "match_liked" : "match_passed", {
          score: candidate.compatibility_score,
          breed: candidate.breed,
        });

        if (result.isMutualMatch) {
          track("match_created");
          setMutualMatchDog(candidate);
        }
        setCurrentIndex((prev) => prev + 1);
      } catch (error) {
        console.error("[Match Action Client Error]", error);
        setActionError(
          "No pudimos registrar tu decisión. Revisa tu conexión e inténtalo nuevamente.",
        );
      } finally {
        submittingRef.current = false;
      }
    });
  }

  return (
    <div>
      {/* 1. CARD DISPLAY OR EMPTY STATE */}
      {currentCandidate ? (
        <div className="mx-auto max-w-lg">
          <div className="edge-card relative overflow-hidden bg-white shadow-[8px_8px_0_var(--ink)]">
            {/* Compatibility pill top overlay */}
            <div className="absolute right-4 top-4 z-20 flex items-center gap-1.5 border-2 border-ink bg-sun px-3 py-1 font-display text-xs uppercase tracking-wider text-ink shadow-[2px_2px_0_var(--ink)]">
              <Sparkles size={14} className="text-electric" />
              <span>Compatibilidad estimada: {currentCandidate.compatibility_score}%</span>
            </div>

            {/* Photo */}
            <div className="relative aspect-4/3 w-full border-b-2 border-ink bg-cream-deep sm:aspect-square">
              {currentCandidate.photo_url ? (
                <Image
                  src={currentCandidate.photo_url}
                  alt={currentCandidate.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 500px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex size-full items-center justify-center font-display text-xs uppercase text-ink/40">
                  Sin foto
                </div>
              )}
            </div>

            {/* Info Body */}
            <div className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-3xl uppercase tracking-tight text-ink">
                    {currentCandidate.name}
                  </h3>
                  <p className="mt-0.5 text-sm text-ink/75">
                    {currentCandidate.breed} · {formatAge(currentCandidate.birth_date)}
                  </p>
                </div>
                {locationLabel ? (
                  <span className="flex items-center gap-1 border border-ink bg-cream px-2 py-0.5 font-display text-[11px] text-ink shadow-[1px_1px_0_var(--ink)]">
                    <MapPin size={12} /> {locationLabel}
                  </span>
                ) : null}
              </div>

              {/* Badges */}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 border border-ink bg-cream px-2.5 py-1 font-display text-xs uppercase text-ink">
                  <Zap size={12} className="text-ink/60" /> {currentCandidate.energy_level}
                </span>
                <span className="inline-flex items-center gap-1 border border-ink bg-cream px-2.5 py-1 font-display text-xs uppercase text-ink">
                  <Users size={12} className="text-ink/60" /> {currentCandidate.sociability}
                </span>
                <span className="border border-ink bg-cream px-2.5 py-1 font-display text-xs uppercase text-ink">
                  Tamaño {currentCandidate.size}
                </span>
                {currentSex ? (
                  <span className="border border-ink bg-cream px-2.5 py-1 font-display text-xs uppercase text-ink">
                    {currentSex}
                  </span>
                ) : null}
              </div>

              {/* Personality tags */}
              {currentCandidate.personality_tags?.length ? (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {currentCandidate.personality_tags.map((tag) => (
                    <span
                      key={tag}
                      className="border border-ink bg-cream-deep px-2 py-0.5 font-display text-[11px] uppercase text-ink"
                    >
                      {personalityLabel(tag)}
                    </span>
                  ))}
                </div>
              ) : null}

              {/* Bio */}
              {currentCandidate.bio ? (
                <p className="mt-4 border-t-2 border-ink pt-3 text-xs leading-5 text-ink/80">
                  “{currentCandidate.bio}”
                </p>
              ) : null}
            </div>

            {/* PASS / LIKE ACTION BAR */}
            <div className="grid grid-cols-2 gap-3 border-t-2 border-ink bg-cream p-4">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => handleAction("pass")}
                disabled={isPending}
                className="w-full gap-2 border-2 hover:bg-danger/10 hover:text-danger"
              >
                {isPending ? (
                  <LoaderCircle className="animate-spin" size={18} />
                ) : (
                  <X size={20} />
                )}
                <span>PASAR</span>
              </Button>

              <Button
                type="button"
                size="lg"
                onClick={() => handleAction("like")}
                disabled={isPending}
                className="w-full gap-2 bg-electric hover:bg-electric-hover"
              >
                {isPending ? (
                  <LoaderCircle className="animate-spin" size={18} />
                ) : (
                  <Heart size={20} className="fill-white" />
                )}
                <span>ME GUSTA</span>
              </Button>
              {actionError ? (
                <p
                  role="alert"
                  aria-live="polite"
                  className="col-span-2 border-2 border-danger bg-white px-3 py-2 text-xs font-semibold text-danger"
                >
                  {actionError}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        /* EMPTY STATE */
        <div className="mx-auto max-w-lg border-2 border-ink bg-white p-12 text-center shadow-[6px_6px_0_var(--ink)]">
          <div className="mx-auto flex size-16 items-center justify-center border-2 border-ink bg-sun text-ink shadow-[3px_3px_0_var(--ink)]">
            <PawPrint size={32} />
          </div>
          <h3 className="mt-5 font-display text-2xl uppercase tracking-tight text-ink">
            Ya viste todos los perros disponibles
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-ink/75">
            Has revisado todos los candidatos compatibles por ahora. Vuelve más tarde cuando nuevos perros
            se unan a la comunidad o explora perros cercanos en el mapa.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/nearby"
              className="border-2 border-ink bg-electric px-4 py-2 font-display text-xs uppercase tracking-wider text-white shadow-[2px_2px_0_var(--ink)] transition hover:bg-electric-hover"
            >
              Explorar Mapa
            </Link>
            <Link
              href="/discover"
              className="border-2 border-ink bg-white px-4 py-2 font-display text-xs uppercase tracking-wider text-ink shadow-[2px_2px_0_var(--ink)] transition hover:bg-cream-deep"
            >
              Ver Comunidad
            </Link>
          </div>
        </div>
      )}

      {/* 2. MUTUAL MATCH CELEBRATION MODAL */}
      {mutualMatchDog ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/75 p-4 backdrop-blur-xs"
        >
          <div className="relative w-full max-w-md border-2 border-ink bg-cream p-6 text-center shadow-[8px_8px_0_var(--ink)] sm:p-8">
            <button
              type="button"
              onClick={() => setMutualMatchDog(null)}
              className="absolute right-4 top-4 flex size-8 items-center justify-center border-2 border-ink bg-white shadow-[2px_2px_0_var(--ink)] hover:bg-sun"
            >
              <X size={16} />
            </button>

            <span className="inline-block border border-ink bg-sun px-2.5 py-0.5 font-display text-[10px] uppercase tracking-widest text-ink shadow-[1px_1px_0_var(--ink)]">
              ¡Interés Mutuo!
            </span>

            <h2 className="mt-3 font-display text-3xl uppercase tracking-tight text-ink sm:text-4xl">
              ¡Hicieron Match! 🐾
            </h2>
            <p className="mt-2 text-xs text-ink/80">
              A {mutualMatchDog.name} también le gustó el pasaporte de {activeDog.name}. ¡Es hora de
              conectar!
            </p>

            {/* Dog Avatars Dual Preview */}
            <div className="my-6 flex items-center justify-center gap-3">
              <div className="text-center">
                <DogAvatar
                  src={activeDog.photo_url}
                  name={activeDog.name}
                  size="md"
                  className="mx-auto border-2 border-ink shadow-[3px_3px_0_var(--ink)]"
                />
                <span className="mt-1 block font-display text-xs uppercase text-ink">
                  {activeDog.name}
                </span>
              </div>

              <div className="flex size-10 items-center justify-center border-2 border-ink bg-electric text-white shadow-[2px_2px_0_var(--ink)]">
                <Heart size={20} className="fill-white" />
              </div>

              <div className="text-center">
                <DogAvatar
                  src={mutualMatchDog.photo_url}
                  name={mutualMatchDog.name}
                  size="md"
                  className="mx-auto border-2 border-ink shadow-[3px_3px_0_var(--ink)]"
                />
                <span className="mt-1 block font-display text-xs uppercase text-ink">
                  {mutualMatchDog.name}
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-2">
              <Link
                href={`/messages`}
                className="flex w-full items-center justify-center gap-2 border-2 border-ink bg-electric py-2.5 font-display text-xs uppercase tracking-wider text-white shadow-[3px_3px_0_var(--ink)] transition hover:bg-electric-hover"
              >
                <MessageCircle size={15} />
                <span>Enviar mensaje</span>
              </Link>

              <Link
                href={`/playdates`}
                className="flex w-full items-center justify-center gap-2 border-2 border-ink bg-sun py-2.5 font-display text-xs uppercase tracking-wider text-ink shadow-[3px_3px_0_var(--ink)] transition hover:bg-sun/80"
              >
                <Calendar size={15} />
                <span>Proponer Playdate</span>
              </Link>

              <Link
                href={`/dog/${mutualMatchDog.slug}`}
                className="flex w-full items-center justify-center border-2 border-ink bg-white py-2 font-display text-xs uppercase tracking-wider text-ink shadow-[2px_2px_0_var(--ink)] transition hover:bg-cream-deep"
              >
                Ver Pasaporte
              </Link>

              <button
                type="button"
                onClick={() => setMutualMatchDog(null)}
                className="pt-2 font-display text-xs uppercase tracking-wider text-ink/70 hover:underline"
              >
                Seguir descubriendo perros
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
