import { describe, expect, it } from "vitest";

import { demoDogs, demoPreferences } from "@/lib/demo-data";
import {
  buildDogSlug,
  calculateAge,
  calculateProfileCompleteness,
  canonicalFriendshipPair,
  formatAge,
  formatApproxDistance,
  sexLabel,
  slugify,
} from "@/lib/utils";

describe("dog identity utilities", () => {
  it("creates URL-safe stable slugs without relying on a unique name", () => {
    expect(slugify("  Ñuñoa & Pelú!  ")).toBe("nunoa-pelu");
    expect(
      buildDogSlug("Rocky", "8f32ab00-1234-4567-8901-123456789012"),
    ).toBe("rocky-8f32ab");
  });

  it("calculates age in complete months", () => {
    const now = new Date("2026-09-01T12:00:00Z");
    expect(calculateAge("2023-09-02", now)).toBe(35);
    expect(formatAge("2023-09-02", now)).toBe("2 años y 11 meses");
    expect(calculateAge("2027-01-01", now)).toBeNull();
  });

  it("derives completeness rather than persisting a stale percentage", () => {
    const rocky = demoDogs[0];
    expect(
      calculateProfileCompleteness(
        rocky,
        demoPreferences.filter((item) => item.dog_id === rocky.id),
      ),
    ).toBe(100);

    expect(
      calculateProfileCompleteness(
        {
          ...rocky,
          photo_path: null,
          birth_date: null,
          adoption_date: null,
          weight_kg: null,
          bio: "",
        },
        [],
      ),
    ).toBe(44);
  });

  it("canonicalizes friendship pairs and rejects self-friendship", () => {
    expect(canonicalFriendshipPair("dog-b", "dog-a")).toEqual(["dog-a", "dog-b"]);
    expect(() => canonicalFriendshipPair("dog-a", "dog-a")).toThrow(
      "Un perro no puede agregarse a sí mismo.",
    );
  });

  it("formats known dog sex values for Spanish public UI and omits unknown values", () => {
    expect(sexLabel("male")).toBe("Macho");
    expect(sexLabel("female")).toBe("Hembra");
    expect(sexLabel("unknown")).toBeNull();
    expect(sexLabel(null)).toBeNull();
  });

  it("formats approximate distances in Spanish and omits missing values", () => {
    expect(formatApproxDistance(0.4)).toBe("A menos de 1 km");
    expect(formatApproxDistance(0.9)).toBe("A menos de 1 km");
    expect(formatApproxDistance(1.0)).toBe("A 1 km");
    expect(formatApproxDistance(1.4)).toBe("A 1,4 km");
    expect(formatApproxDistance(3.5)).toBe("A 3,5 km");
    expect(formatApproxDistance(12.2)).toBe("A 12,2 km");
    expect(formatApproxDistance(null)).toBeNull();
    expect(formatApproxDistance(undefined)).toBeNull();
  });
});
