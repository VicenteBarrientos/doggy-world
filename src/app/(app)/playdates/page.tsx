import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PlaydatesClientView } from "@/components/playdates/playdates-client-view";
import { getOwnerDogs } from "@/lib/data/dogs";
import { getDogFriendConnections } from "@/lib/data/friendships";
import { getDogMatches } from "@/lib/data/matching";
import { getDogPlaydates } from "@/lib/data/playdates";
import { requireViewer } from "@/lib/data/viewer";
import type { DogWithPhoto } from "@/types/database";

export const metadata: Metadata = {
  title: "Playdates · Encuentros caninos · Doggy World",
  description: "Organiza paseos y encuentros seguros entre perros amigos y compatibles.",
};

export default async function PlaydatesPage() {
  await requireViewer();
  const ownerDogs = await getOwnerDogs();

  if (ownerDogs.length === 0) {
    redirect("/dogs/new");
  }

  const activeDog = ownerDogs[0];
  const [playdates, friendConnections, matches] = await Promise.all([
    getDogPlaydates(activeDog.id),
    getDogFriendConnections(activeDog.id),
    getDogMatches(activeDog.id),
  ]);

  // Merge friends and matches into a unique list of potential partners
  const partnerMap = new Map<string, DogWithPhoto>();
  for (const conn of friendConnections) {
    partnerMap.set(conn.friend.id, conn.friend);
  }
  for (const matchDog of matches) {
    partnerMap.set(matchDog.id, matchDog);
  }
  const potentialPartners = Array.from(partnerMap.values());

  return (
    <div className="space-y-6">
      <div>
        <span className="border border-ink bg-sun px-2 py-0.5 font-display text-[10px] uppercase tracking-widest text-ink shadow-[1px_1px_0_var(--ink)]">
          Socialización real
        </span>
        <h1 className="mt-2 font-display text-3xl uppercase tracking-tight text-ink sm:text-4xl">
          Encuentros y Playdates
        </h1>
        <p className="mt-1 max-w-2xl text-xs text-ink/75 sm:text-sm">
          Organiza paseos, juegos y salidas con amigos caninos en lugares públicos y seguros.
        </p>
      </div>

      <PlaydatesClientView
        activeDog={activeDog}
        allOwnerDogs={ownerDogs}
        potentialPartners={potentialPartners}
        upcoming={playdates.upcoming}
        invitations={playdates.invitations}
        past={playdates.past}
      />
    </div>
  );
}
