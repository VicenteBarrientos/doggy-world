import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { TrackEvent } from "@/components/analytics/track-event";
import { MatchDeck } from "@/components/matching/match-deck";
import { getOwnerDogs } from "@/lib/data/dogs";
import { getMatchCandidates } from "@/lib/data/matching";
import { requireViewer } from "@/lib/data/viewer";

export const metadata: Metadata = {
  title: "Doggy Match · Encuentra su próximo amigo · Doggy World",
  description: "Conecta perros compatibles según tamaño, energía, carácter y cercanía.",
};

export default async function MatchPage() {
  await requireViewer();
  const ownerDogs = await getOwnerDogs();

  if (ownerDogs.length === 0) {
    redirect("/dogs/new");
  }

  const activeDog = ownerDogs[0];
  const candidates = await getMatchCandidates(activeDog.id);

  return (
    <div className="space-y-6">
      <TrackEvent name="match_opened" properties={{ dog_id: activeDog.id }} />

      <div className="text-center sm:text-left">
        <span className="border border-ink bg-sun px-2 py-0.5 font-display text-[10px] uppercase tracking-widest text-ink shadow-[1px_1px_0_var(--ink)]">
          Doggy Match
        </span>
        <h1 className="mt-2 font-display text-3xl uppercase tracking-tight text-ink sm:text-4xl">
          Encuentra su próximo amigo
        </h1>
        <p className="mt-1 text-xs text-ink/75 sm:text-sm">
          Descubre compañeros compatibles para {activeDog.name} y haz match con otros dueños de la
          comunidad.
        </p>
      </div>

      <MatchDeck activeDog={activeDog} initialCandidates={candidates} />
    </div>
  );
}
