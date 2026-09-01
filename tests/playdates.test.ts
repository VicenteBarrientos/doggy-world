import { describe, expect, it } from "vitest";

import { createPlaydateAction, respondPlaydateInviteAction } from "@/app/actions/playdates";
import { initialActionState } from "@/lib/forms";

describe("Playdates Validation & Safety Rules", () => {
  it("rejects playdate creation when host and invited dog are the same", async () => {
    const fd = new FormData();
    fd.set("hostDogId", "11111111-1111-4111-8111-111111111111");
    fd.set("invitedDogId", "11111111-1111-4111-8111-111111111111");
    fd.set("title", "Paseo en el parque");
    fd.set("startsAt", new Date(Date.now() + 86400000).toISOString());
    fd.set("city", "Santiago");
    fd.set("locationLabel", "Parque Inés de Suárez");

    const result = await createPlaydateAction(initialActionState, fd);
    expect(result.status).toBe("error");
    expect(result.message).toContain("mismo perro");
  });

  it("rejects playdate creation with empty title or missing location", async () => {
    const fd = new FormData();
    fd.set("hostDogId", "11111111-1111-4111-8111-111111111111");
    fd.set("invitedDogId", "22222222-2222-4222-8222-222222222222");
    fd.set("title", " "); // Blank
    fd.set("startsAt", new Date().toISOString());
    fd.set("city", "Santiago");
    fd.set("locationLabel", "");

    const result = await createPlaydateAction(initialActionState, fd);
    expect(result.status).toBe("error");
  });

  it("rejects invalid invitation responses", async () => {
    const fd = new FormData();
    fd.set("playdateId", "p1111111-1111-4111-8111-111111111111");
    fd.set("dogId", "11111111-1111-4111-8111-111111111111");
    fd.set("response", "maybe"); // Invalid status

    const result = await respondPlaydateInviteAction(initialActionState, fd);
    expect(result.status).toBe("error");
  });
});
