import { describe, expect, it } from "vitest";

import { calculateMatchCompatibility } from "@/lib/match-heuristic";
import { recordMatchAction } from "@/app/actions/matching";
import { initialActionState } from "@/lib/forms";

describe("Doggy Match Heuristic & Constraints", () => {
  const socialLargeHigh = {
    energy_level: "high",
    size: "large",
    sociability: "social",
    personality_tags: ["playful", "fetch", "social"],
    play_style: "Correr y jugar",
  } as const;

  const identicalDog = {
    energy_level: "high",
    size: "large",
    sociability: "social",
    personality_tags: ["playful", "fetch"],
    play_style: "Correr",
  } as const;

  const divergentDog = {
    energy_level: "low",
    size: "small",
    sociability: "shy",
    personality_tags: ["calm"],
    play_style: "Dormir",
  } as const;

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
});
