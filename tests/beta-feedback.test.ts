import { describe, expect, it } from "vitest";

import { submitBetaFeedbackAction } from "@/app/actions/beta-feedback";
import { betaFeedbackCategories } from "@/lib/beta-feedback";
import { initialActionState } from "@/lib/forms";

describe("Beta Feedback Action", () => {
  it("defines the expected beta feedback categories", () => {
    expect(betaFeedbackCategories).toContain("Algo no funciona");
    expect(betaFeedbackCategories).toContain("No entendí algo");
    expect(betaFeedbackCategories).toContain("Tengo una idea");
    expect(betaFeedbackCategories).toContain("Me gustó algo");
    expect(betaFeedbackCategories).toContain("Otro");
  });

  it("accepts feedback as a no-op in automatic demo fallback", async () => {
    const formData = new FormData();
    formData.set("message", "Excelente diseño y rapidez!");
    formData.set("category", "Me gustó algo");

    const result = await submitBetaFeedbackAction(initialActionState, formData);
    expect(result.status).toBe("success");
    expect(result.message).toBeDefined();
    expect(result.message ?? "").toMatch(/sesión demo/);
  });

  it("validates that empty or very short messages are rejected", async () => {
    const formData = new FormData();
    formData.set("message", "ok"); // Less than 3 characters

    const result = await submitBetaFeedbackAction(initialActionState, formData);
    expect(result.status).toBe("error");
  });
});
