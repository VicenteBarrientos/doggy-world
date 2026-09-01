import { describe, expect, it } from "vitest";

import {
  dogSchema,
  friendRequestSchema,
  productFeedbackSchema,
} from "@/lib/validation";

const validDog = {
  name: "Rocky",
  breed: "Golden Retriever",
  mixedBreed: false,
  sex: "male" as const,
  birthDate: "2023-04-18",
  adoptionDate: "2023-07-02",
  weightKg: 31,
  size: "large" as const,
  energyLevel: "high" as const,
  sociability: "very_social" as const,
  playStyle: "Fetch",
  personalityTags: ["playful", "social"],
  bio: "Un perro feliz que siempre está listo para jugar.",
  city: "Santiago",
  country: "Chile",
  isPublic: true,
};

describe("domain validation", () => {
  it("accepts a complete dog passport", () => {
    expect(dogSchema.safeParse(validDog).success).toBe(true);
  });

  it("rejects impossible adoption chronology and too many tags", () => {
    const result = dogSchema.safeParse({
      ...validDog,
      adoptionDate: "2022-01-01",
      personalityTags: ["a", "b", "c", "d", "e", "f", "g"],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.adoptionDate).toBeDefined();
      expect(result.error.flatten().fieldErrors.personalityTags).toBeDefined();
    }
  });

  it("validates structured product feedback", () => {
    const result = productFeedbackSchema.safeParse({
      dogId: "11111111-1111-4111-8111-111111111111",
      productId: "aaaaaaaa-1111-4111-8111-111111111111",
      reaction: "loved",
      rating: 5,
      favorite: true,
      destroyed: false,
      lifetimeHours: 720,
      wouldBuyAgain: true,
      notes: "Sigue entero.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects self-friendship before touching the database", () => {
    const id = "11111111-1111-4111-8111-111111111111";
    expect(
      friendRequestSchema.safeParse({ requesterDogId: id, recipientDogId: id })
        .success,
    ).toBe(false);
  });
});
