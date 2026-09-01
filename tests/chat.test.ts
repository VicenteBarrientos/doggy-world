import { describe, expect, it } from "vitest";

import { sendMessageAction } from "@/app/actions/chat";
import { initialActionState } from "@/lib/forms";

describe("Dog Chat Validation & Safety Rules", () => {
  it("rejects empty message body", async () => {
    const fd = new FormData();
    fd.set("conversationId", "c1111111-1111-4111-8111-111111111111");
    fd.set("senderDogId", "11111111-1111-4111-8111-111111111111");
    fd.set("body", "   ");

    const result = await sendMessageAction(initialActionState, fd);
    expect(result.status).toBe("error");
    expect(result.message).toContain("vacío");
  });

  it("rejects message body exceeding 1000 characters", async () => {
    const fd = new FormData();
    fd.set("conversationId", "c1111111-1111-4111-8111-111111111111");
    fd.set("senderDogId", "11111111-1111-4111-8111-111111111111");
    fd.set("body", "a".repeat(1001));

    const result = await sendMessageAction(initialActionState, fd);
    expect(result.status).toBe("error");
    expect(result.message).toContain("1000");
  });

  it("rejects invalid conversation or sender uuid", async () => {
    const fd = new FormData();
    fd.set("conversationId", "not-a-uuid");
    fd.set("senderDogId", "11111111-1111-4111-8111-111111111111");
    fd.set("body", "¡Hola!");

    const result = await sendMessageAction(initialActionState, fd);
    expect(result.status).toBe("error");
    expect(result.message).toContain("Conversación");
  });
});
