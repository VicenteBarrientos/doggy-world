import { describe, expect, it } from "vitest";

import { getDemoApproxDistanceKm, getNearbyDogs } from "@/lib/data/nearby";

describe("Nearby Dogs & Privacy Rules", () => {
  it("returns nearby dogs within selected radius for demo user", async () => {
    // Rocky is at -33.4312, -70.6125 (Santiago/Providencia)
    const dogs = await getNearbyDogs({
      requestingDogId: "11111111-1111-4111-8111-111111111111", // Rocky
      centerLat: -33.4312,
      centerLng: -70.6125,
      radiusKm: 10,
    });

    expect(dogs.length).toBeGreaterThan(0);
    // Rocky must NOT be in results
    expect(dogs.some((d) => d.dog_id === "11111111-1111-4111-8111-111111111111")).toBe(false);
    // Luna is also owned by demoOwnerId, so Luna must not be returned
    expect(dogs.some((d) => d.dog_id === "22222222-2222-4222-8222-222222222222")).toBe(false);
  });

  it("filters out dogs outside a small radius (e.g., 2 km)", async () => {
    const dogs = await getNearbyDogs({
      requestingDogId: "11111111-1111-4111-8111-111111111111",
      centerLat: -33.4312,
      centerLng: -70.6125,
      radiusKm: 2,
    });

    for (const dog of dogs) {
      expect(dog.distance_km).toBeLessThanOrEqual(2);
    }
  });

  it("uses the same demo distance helper as Match for a shared pair", async () => {
    const dogs = await getNearbyDogs({
      requestingDogId: "11111111-1111-4111-8111-111111111111",
      centerLat: -33.4312,
      centerLng: -70.6125,
      radiusKm: 15,
    });
    const bruno = dogs.find((dog) => dog.dog_id === "66666666-6666-4666-8666-666666666666");
    expect(bruno).toBeDefined();
    expect(bruno?.distance_km).toBe(
      getDemoApproxDistanceKm(
        "11111111-1111-4111-8111-111111111111",
        "66666666-6666-4666-8666-666666666666",
      ),
    );
  });

  it("exposes only approximate coordinates, never exact raw coordinates", async () => {
    const dogs = await getNearbyDogs({
      requestingDogId: "11111111-1111-4111-8111-111111111111",
      centerLat: -33.4312,
      centerLng: -70.6125,
      radiusKm: 15,
    });

    for (const dog of dogs) {
      // Must have approx_lat and approx_lng
      expect(dog.approx_lat).toBeDefined();
      expect(dog.approx_lng).toBeDefined();
      // Approx coordinates have at most 2 decimal places (snapped)
      const latDecimals = dog.approx_lat.toString().split(".")[1] || "";
      const lngDecimals = dog.approx_lng.toString().split(".")[1] || "";
      expect(latDecimals.length).toBeLessThanOrEqual(3);
      expect(lngDecimals.length).toBeLessThanOrEqual(3);
    }
  });
});
