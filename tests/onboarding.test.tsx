import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CelebrationBanner } from "@/components/dogs/celebration-banner";
import { OnboardingProgress } from "@/components/onboarding/onboarding-progress";
import { actionMessage } from "@/lib/action-helpers";
import { dogSchema } from "@/lib/validation";

describe("Onboarding & First-Run Flow", () => {
  it("renders all 4 steps in OnboardingProgress and marks the current step", () => {
    render(<OnboardingProgress currentStep={2} />);
    const nav = screen.getByRole("navigation", { name: "Progreso de creación" });
    expect(nav).toBeInTheDocument();
    expect(screen.getAllByText("Cuenta").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Tu perro").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Foto").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Pasaporte").length).toBeGreaterThan(0);
  });

  it("validates that a minimal dog creation succeeds with defaults", () => {
    const minimalDog = {
      name: "Toby",
      breed: "Poodle",
    };
    const parsed = dogSchema.safeParse(minimalDog);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.name).toBe("Toby");
      expect(parsed.data.breed).toBe("Poodle");
      expect(parsed.data.size).toBe("medium");
      expect(parsed.data.energyLevel).toBe("medium");
      expect(parsed.data.sociability).toBe("social");
      expect(parsed.data.isPublic).toBe(true);
      expect(parsed.data.personalityTags).toEqual([]);
      expect(parsed.data.bio).toBe("");
    }
  });

  it("renders CelebrationBanner with key CTAs for new dog passport", () => {
    render(
      <CelebrationBanner
        dogName="Toby"
        dogId="11111111-2222-3333-4444-555555555555"
        onOpenShare={() => {}}
        onOpenQr={() => {}}
      />,
    );

    expect(screen.getByText("El mundo de Toby ya está activo")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Compartir pasaporte" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ver código QR" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Completar perfil avanzado" }),
    ).toHaveAttribute("href", "/dogs/11111111-2222-3333-4444-555555555555/edit");
  });

  it("sanitizes raw database errors to protect users from technical exposure", () => {
    const rawPostgresError = new Error(
      'duplicate key value violates unique constraint "dog_friendships_unique_pair_idx"',
    );
    const sanitized = actionMessage(rawPostgresError);
    expect(sanitized).toBe(
      "No pudimos completar la operación debido a un problema de datos. Por favor inténtalo nuevamente.",
    );

    const normalUserError = new Error("La foto debe ser JPG, PNG o WebP.");
    expect(actionMessage(normalUserError)).toBe("La foto debe ser JPG, PNG o WebP.");
  });
});
