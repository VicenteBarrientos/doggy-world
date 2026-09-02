import "server-only";

import { getDemoApproxDistanceKm } from "@/lib/data/nearby";
import { resolveDogPhoto } from "@/lib/data/photos";
import { requireViewer } from "@/lib/data/viewer";
import { demoDogs } from "@/lib/demo-data";
import { calculateMatchCompatibility } from "@/lib/match-heuristic";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { DogWithPhoto, MatchCandidateDog } from "@/types/database";

type AppSupabaseClient = Awaited<ReturnType<typeof createClient>>;

function parseOwnerGeoPoint(location: unknown): { lat: number; lng: number } | null {
  if (!location) return null;

  if (typeof location === "string") {
    const match = location.match(/POINT\s*\(\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s*\)/i);
    if (!match) return null;
    const lng = Number(match[1]);
    const lat = Number(match[2]);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  }

  if (typeof location !== "object") return null;
  const value = location as {
    coordinates?: unknown;
    lat?: unknown;
    lng?: unknown;
    latitude?: unknown;
    longitude?: unknown;
  };

  if (Array.isArray(value.coordinates) && value.coordinates.length >= 2) {
    const lng = Number(value.coordinates[0]);
    const lat = Number(value.coordinates[1]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  }

  const lat = Number(value.lat ?? value.latitude);
  const lng = Number(value.lng ?? value.longitude);
  if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  return null;
}

async function getRealMatchDistances(
  supabase: AppSupabaseClient,
  requestingDogId: string,
): Promise<Map<string, number>> {
  const distances = new Map<string, number>();
  const { data: ownLocation } = await supabase
    .from("dog_locations")
    .select("location")
    .eq("dog_id", requestingDogId)
    .maybeSingle();

  const origin = parseOwnerGeoPoint(ownLocation?.location);
  if (!origin) return distances;

  const { data: rows, error } = await supabase.rpc("get_nearby_dogs", {
    requesting_dog_id: requestingDogId,
    center_lat: origin.lat,
    center_lng: origin.lng,
    radius_km: 50,
  });

  if (error) {
    console.error("[Match Distance RPC Error]", error);
    return distances;
  }

  for (const row of rows ?? []) {
    if (typeof row.distance_km === "number" && Number.isFinite(row.distance_km)) {
      distances.set(row.dog_id, row.distance_km);
    }
  }

  return distances;
}

// In-memory demo actions store for demo mode sessions
const demoMatchActions = new Set<string>(); // `${fromDogId}:${toDogId}`
const demoMutualMatches = new Set<string>(); // `${least(a, b)}:${greatest(a, b)}`

export function recordDemoMatchAction(fromDogId: string, toDogId: string, action: "like" | "pass"): boolean {
  demoMatchActions.add(`${fromDogId}:${toDogId}`);
  if (action === "like") {
    // If a reverse like exists, or if liking Coco in demo, create a mutual match.
    // Coco is owned by another demo profile and therefore appears in Rocky's deck.
    const reverseKey = `${toDogId}:${fromDogId}`;
    const isReverseLiked = demoMatchActions.has(reverseKey) || toDogId === demoDogs[2].id;
    if (isReverseLiked) {
      const pairKey = fromDogId < toDogId ? `${fromDogId}:${toDogId}` : `${toDogId}:${fromDogId}`;
      demoMutualMatches.add(pairKey);
      return true;
    }
  }
  return false;
}

export async function getMatchCandidates(dogId: string): Promise<MatchCandidateDog[]> {
  const viewer = await requireViewer();

  if (viewer.isDemo || !isSupabaseConfigured()) {
    const requestingDog = demoDogs.find((d) => d.id === dogId) || demoDogs[0];
    const candidates: MatchCandidateDog[] = [];

    for (const dog of demoDogs) {
      if (dog.id === dogId) continue;
      if (dog.owner_id === viewer.id) continue;
      if (!dog.is_public) continue;
      if (demoMatchActions.has(`${dogId}:${dog.id}`)) continue;

      const approxDistanceKm = getDemoApproxDistanceKm(requestingDog.id, dog.id);
      const score = calculateMatchCompatibility(requestingDog, dog, approxDistanceKm);
      candidates.push({
        ...dog,
        compatibility_score: score,
        approx_distance_km: approxDistanceKm,
      });
    }

    return candidates.sort((a, b) => b.compatibility_score - a.compatibility_score);
  }

  const supabase = await createClient();

  // 1. Get requesting dog
  const { data: requestingDog } = await supabase
    .from("dogs")
    .select("*")
    .eq("id", dogId)
    .single();

  if (!requestingDog) return [];

  // 2. Get IDs already acted upon
  const { data: pastActions } = await supabase
    .from("dog_match_actions")
    .select("to_dog_id")
    .eq("from_dog_id", dogId);

  const excludedIds = new Set((pastActions || []).map((a) => a.to_dog_id));
  excludedIds.add(dogId);

  // 3. Get candidates
  const { data: rawCandidates } = await supabase
    .from("dogs")
    .select("*")
    .eq("is_public", true)
    .neq("owner_id", viewer.id)
    .limit(30);

  if (!rawCandidates || rawCandidates.length === 0) return [];

  const distances = await getRealMatchDistances(supabase, dogId);
  const candidates: MatchCandidateDog[] = [];
  for (const c of rawCandidates) {
    if (excludedIds.has(c.id)) continue;

    const approxDistanceKm = distances.get(c.id);
    const score = calculateMatchCompatibility(requestingDog, c, approxDistanceKm);
    candidates.push({
      ...c,
      photo_url: await resolveDogPhoto(c.photo_path),
      compatibility_score: score,
      approx_distance_km: approxDistanceKm,
    });
  }

  return candidates.sort((a, b) => b.compatibility_score - a.compatibility_score);
}

export async function getDogMatches(dogId: string): Promise<DogWithPhoto[]> {
  const viewer = await requireViewer();

  if (viewer.isDemo || !isSupabaseConfigured()) {
    const matchedDogs: DogWithPhoto[] = [];
    for (const pairKey of demoMutualMatches) {
      const [a, b] = pairKey.split(":");
      if (a === dogId || b === dogId) {
        const otherId = a === dogId ? b : a;
        const otherDog = demoDogs.find((d) => d.id === otherId);
        if (otherDog) matchedDogs.push(otherDog);
      }
    }
    return matchedDogs;
  }

  const supabase = await createClient();
  const { data: matches } = await supabase
    .from("dog_matches")
    .select("dog_a_id, dog_b_id")
    .or(`dog_a_id.eq.${dogId},dog_b_id.eq.${dogId}`)
    .eq("status", "active");

  if (!matches || matches.length === 0) return [];

  const otherDogIds = matches.map((m) => (m.dog_a_id === dogId ? m.dog_b_id : m.dog_a_id));
  const { data: dogs } = await supabase.from("dogs").select("*").in("id", otherDogIds);

  if (!dogs) return [];

  return Promise.all(
    dogs.map(async (d) => ({
      ...d,
      photo_url: await resolveDogPhoto(d.photo_path),
    })),
  );
}
