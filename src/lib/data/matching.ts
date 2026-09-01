import "server-only";

import { resolveDogPhoto } from "@/lib/data/photos";
import { requireViewer } from "@/lib/data/viewer";
import { demoDogs } from "@/lib/demo-data";
import { calculateMatchCompatibility } from "@/lib/match-heuristic";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { DogWithPhoto, MatchCandidateDog } from "@/types/database";

// In-memory demo actions store for demo mode sessions
const demoMatchActions = new Set<string>(); // `${fromDogId}:${toDogId}`
const demoMutualMatches = new Set<string>(); // `${least(a, b)}:${greatest(a, b)}`

export function recordDemoMatchAction(fromDogId: string, toDogId: string, action: "like" | "pass"): boolean {
  demoMatchActions.add(`${fromDogId}:${toDogId}`);
  if (action === "like") {
    // If reverse like exists, or if liking Luna/Coco in demo, create mutual match!
    const reverseKey = `${toDogId}:${fromDogId}`;
    const isReverseLiked = demoMatchActions.has(reverseKey) || toDogId === demoDogs[1].id;
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

      const score = calculateMatchCompatibility(requestingDog, dog);
      candidates.push({
        ...dog,
        compatibility_score: score,
        approx_distance_km: 3.5,
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

  const candidates: MatchCandidateDog[] = [];
  for (const c of rawCandidates) {
    if (excludedIds.has(c.id)) continue;

    const score = calculateMatchCompatibility(requestingDog, c);
    candidates.push({
      ...c,
      photo_url: await resolveDogPhoto(c.photo_path),
      compatibility_score: score,
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
