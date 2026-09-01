import type { Dog } from "@/types/database";

const ENERGY_LEVELS = ["low", "medium", "high", "very_high"] as const;
const SIZE_LEVELS = ["small", "medium", "large", "giant"] as const;

export function calculateMatchCompatibility(
  dogA: Pick<Dog, "energy_level" | "size" | "sociability" | "personality_tags" | "play_style">,
  dogB: Pick<Dog, "energy_level" | "size" | "sociability" | "personality_tags" | "play_style">,
  approxDistanceKm?: number,
): number {
  let score = 0;

  // 1. Energy compatibility (0 - 30 pts)
  const energyIdxA = ENERGY_LEVELS.indexOf(dogA.energy_level as (typeof ENERGY_LEVELS)[number]);
  const energyIdxB = ENERGY_LEVELS.indexOf(dogB.energy_level as (typeof ENERGY_LEVELS)[number]);
  const energyDiff = Math.abs((energyIdxA >= 0 ? energyIdxA : 1) - (energyIdxB >= 0 ? energyIdxB : 1));

  if (energyDiff === 0) score += 30;
  else if (energyDiff === 1) score += 22;
  else if (energyDiff === 2) score += 12;
  else score += 5;

  // 2. Size compatibility (0 - 25 pts)
  const sizeIdxA = SIZE_LEVELS.indexOf(dogA.size as (typeof SIZE_LEVELS)[number]);
  const sizeIdxB = SIZE_LEVELS.indexOf(dogB.size as (typeof SIZE_LEVELS)[number]);
  const sizeDiff = Math.abs((sizeIdxA >= 0 ? sizeIdxA : 1) - (sizeIdxB >= 0 ? sizeIdxB : 1));

  if (sizeDiff === 0) score += 25;
  else if (sizeDiff === 1) score += 20;
  else if (sizeDiff === 2) score += 10;
  else score += 5;

  // 3. Sociability compatibility (0 - 25 pts)
  const isSocialA = dogA.sociability === "social" || dogA.sociability === "very_social";
  const isSocialB = dogB.sociability === "social" || dogB.sociability === "very_social";

  if (isSocialA && isSocialB) {
    score += 25;
  } else if (isSocialA || isSocialB) {
    score += 18;
  } else if (dogA.sociability === "selective" && dogB.sociability === "selective") {
    score += 15;
  } else {
    score += 10;
  }

  // 4. Personality tags / play style overlap (0 - 20 pts)
  const tagsA = new Set(dogA.personality_tags || []);
  let tagOverlap = 0;
  for (const tag of dogB.personality_tags || []) {
    if (tagsA.has(tag)) tagOverlap++;
  }
  score += Math.min(20, tagOverlap * 10);

  // 5. Distance adjustment
  if (approxDistanceKm !== undefined) {
    if (approxDistanceKm > 25) score -= 15;
    else if (approxDistanceKm > 15) score -= 10;
    else if (approxDistanceKm <= 3) score += 5;
  }

  // Clamp between 20% and 99%
  return Math.max(20, Math.min(99, Math.round(score)));
}
