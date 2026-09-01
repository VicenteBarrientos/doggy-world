import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { TrackEvent } from "@/components/analytics/track-event";
import { NearbyClientView } from "@/components/nearby/nearby-client-view";
import { getOwnerDogs } from "@/lib/data/dogs";
import { getDogLocation, getNearbyDogs } from "@/lib/data/nearby";
import { requireViewer } from "@/lib/data/viewer";

export const metadata: Metadata = {
  title: "Perros Cerca de Ti · Doggy World",
  description: "Descubre perros y pasaportes cercanos respetando la privacidad de tu ubicación.",
};

export default async function NearbyPage() {
  await requireViewer();
  const ownerDogs = await getOwnerDogs();

  if (ownerDogs.length === 0) {
    redirect("/dogs/new");
  }

  const primaryDog = ownerDogs[0];
  const [initialLocation, initialNearbyDogs] = await Promise.all([
    getDogLocation(primaryDog.id),
    getNearbyDogs({
      requestingDogId: primaryDog.id,
      centerLat: -33.4372,
      centerLng: -70.6506,
      radiusKm: 25,
    }),
  ]);

  return (
    <div className="space-y-6">
      <TrackEvent name="nearby_opened" properties={{ dog_count: ownerDogs.length }} />

      <div>
        <span className="border border-ink bg-sun px-2 py-0.5 font-display text-[10px] uppercase tracking-widest text-ink shadow-[1px_1px_0_var(--ink)]">
          Exploración de zona
        </span>
        <h1 className="mt-2 font-display text-3xl uppercase tracking-tight text-ink sm:text-4xl">
          Perros cerca de ti
        </h1>
        <p className="mt-1 max-w-2xl text-xs text-ink/75 sm:text-sm">
          Encuentra otros perros en tu radio para coordinar paseos y ampliar su círculo de amigos.
        </p>
      </div>

      <NearbyClientView
        ownerDogs={ownerDogs}
        initialLocation={initialLocation}
        initialNearbyDogs={initialNearbyDogs}
      />
    </div>
  );
}
