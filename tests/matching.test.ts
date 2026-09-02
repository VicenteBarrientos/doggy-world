import { describe, expect, it } from "vitest";

import { calculateMatchCompatibility } from "@/lib/match-heuristic";
import { recordMatchAction } from "@/app/actions/matching";
import { getMatchCandidates, recordDemoMatchAction } from "@/lib/data/matching";
import { getDemoApproxDistanceKm } from "@/lib/data/nearby";
import { demoDogs } from "@/lib/demo-data";
import { initialActionState } from "@/lib/forms";
import type { Dog } from "@/types/database";

type TestDogTraits = Pick<
  Dog,
  "energy_level" | "size" | "sociability" | "personality_tags" | "play_style"
>;

describe("Doggy Match Heuristic & Constraints", () => {
  const socialLargeHigh: TestDogTraits = {
    energy_level: "high",
    size: "large",
    sociability: "social",
    personality_tags: ["playful", "fetch", "social"],
    play_style: "Correr y jugar",
  };

  const identicalDog: TestDogTraits = {
    energy_level: "high",
    size: "large",
    sociability: "social",
    personality_tags: ["playful", "fetch"],
    play_style: "Correr",
  };

  const divergentDog: TestDogTraits = {
    energy_level: "low",
    size: "small",
    sociability: "shy",
    personality_tags: ["calm"],
    play_style: "Dormir",
  };

  it("calculates high compatibility for similar dogs with shared tags", () => {
    const score = calculateMatchCompatibility(socialLargeHigh, identicalDog, 2);
    expect(score).toBeGreaterThanOrEqual(80);
    expect(score).toBeLessThanOrEqual(99);
  });

  it("calculates lower compatibility for divergent dogs with different energy and size", () => {
    const score = calculateMatchCompatibility(socialLargeHigh, divergentDog, 30);
    expect(score).toBeLessThan(45);
    expect(score).toBeGreaterThanOrEqual(20);
  });

  it("applies distance penalty when distance exceeds 25 km", () => {
    const closeScore = calculateMatchCompatibility(socialLargeHigh, identicalDog, 3);
    const farScore = calculateMatchCompatibility(socialLargeHigh, identicalDog, 35);
    expect(closeScore).toBeGreaterThan(farScore);
  });

  it("rejects matching a dog with itself in server action validation", async () => {
    const fd = new FormData();
    fd.set("fromDogId", "11111111-1111-4111-8111-111111111111");
    fd.set("toDogId", "11111111-1111-4111-8111-111111111111");
    fd.set("action", "like");

    const result = await recordMatchAction(initialActionState, fd);
    expect(result.status).toBe("error");
    expect(result.message).toContain("consigo mismo");
  });

  it("creates the deterministic demo mutual match with a reachable candidate", () => {
    expect(recordDemoMatchAction(demoDogs[0].id, demoDogs[2].id, "like")).toBe(true);
  });

  it("attaches varied demo haversine distances instead of a single fake value", async () => {
    const candidates = await getMatchCandidates(demoDogs[0].id);
    const distances = candidates
      .map((candidate) => candidate.approx_distance_km)
      .filter((value): value is number => typeof value === "number");

    expect(candidates.length).toBeGreaterThan(1);
    expect(distances).toHaveLength(candidates.length);
    expect(new Set(distances).size).toBeGreaterThan(1);
    expect(getDemoApproxDistanceKm(demoDogs[0].id, demoDogs[2].id)).toBeGreaterThan(1);
  });
});
