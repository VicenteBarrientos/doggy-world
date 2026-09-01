import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DogForm } from "@/components/dogs/dog-form";

vi.mock("@/app/actions/dogs", () => ({
  createDogAction: vi.fn(),
  updateDogAction: vi.fn(),
}));

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}));

describe("DogForm", () => {
  it("exposes the critical passport fields with accessible labels", () => {
    render(<DogForm />);
    expect(screen.getByLabelText("Nombre *")).toBeRequired();
    expect(screen.getByLabelText("Raza o mezcla *")).toBeRequired();
    expect(screen.getByLabelText("Fecha de nacimiento")).toHaveAttribute("type", "date");
    expect(screen.getByLabelText("Peso aproximado (kg)")).toHaveAttribute("type", "number");
    expect(screen.getByLabelText("Pasaporte público")).toBeChecked();
    expect(screen.getByRole("button", { name: "Crear pasaporte" })).toBeEnabled();
  });
});
