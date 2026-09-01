// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getViewer: vi.fn(),
  requireActionUser: vi.fn(),
  revalidatePath: vi.fn(),
  recordDemoPlaydate: vi.fn(),
  respondDemoPlaydate: vi.fn(),
  getOrCreateDemoConversation: vi.fn(),
  recordDemoMessage: vi.fn(),
  recordDemoFriendRequest: vi.fn(),
  respondDemoFriendRequest: vi.fn(),
  removeDemoFriendship: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("@/lib/data/viewer", () => ({
  getViewer: mocks.getViewer,
}));

vi.mock("@/lib/action-helpers", () => ({
  actionMessage: (error: unknown) =>
    error instanceof Error ? error.message : "Ocurrió un error inesperado.",
  checkboxValue: (formData: FormData, key: string) =>
    formData.get(key) === "on" || formData.get(key) === "true",
  optionalBooleanValue: (formData: FormData, key: string) => {
    const value = formData.get(key);
    if (value === "true" || value === "yes") return true;
    if (value === "false" || value === "no") return false;
    return undefined;
  },
  requireActionUser: mocks.requireActionUser,
  stringValue: (formData: FormData, key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value : "";
  },
}));

vi.mock("@/lib/data/playdates", () => ({
  recordDemoPlaydate: mocks.recordDemoPlaydate,
  respondDemoPlaydate: mocks.respondDemoPlaydate,
}));

vi.mock("@/lib/data/chat", () => ({
  getOrCreateDemoConversation: mocks.getOrCreateDemoConversation,
  recordDemoMessage: mocks.recordDemoMessage,
}));

vi.mock("@/lib/data/friendships", () => ({
  recordDemoFriendRequest: mocks.recordDemoFriendRequest,
  respondDemoFriendRequest: mocks.respondDemoFriendRequest,
  removeDemoFriendship: mocks.removeDemoFriendship,
}));

import { submitBetaFeedbackAction } from "@/app/actions/beta-feedback";
import { sendMessageAction, startConversationAction } from "@/app/actions/chat";
import { saveProductFeedbackAction } from "@/app/actions/feedback";
import {
  removeFriendshipAction,
  respondToFriendRequestAction,
  sendFriendRequestAction,
} from "@/app/actions/friendships";
import {
  saveDogLocationAction,
  toggleNearbyVisibilityAction,
} from "@/app/actions/location";
import {
  createPlaydateAction,
  respondPlaydateInviteAction,
} from "@/app/actions/playdates";
import { demoDogs, demoProducts } from "@/lib/demo-data";
import { initialActionState } from "@/lib/forms";

function demoViewer() {
  return {
    id: demoDogs[0].owner_id,
    email: "demo@doggy.world",
    profile: {},
    isDemo: true,
  };
}

describe("explicit demo social mutations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getViewer.mockResolvedValue(demoViewer());
    mocks.respondDemoPlaydate.mockReturnValue(true);
    mocks.recordDemoMessage.mockReturnValue({ id: crypto.randomUUID() });
    mocks.getOrCreateDemoConversation.mockReturnValue({
      id: "c1111111-1111-4111-8111-111111111111",
    });
    mocks.recordDemoFriendRequest.mockReturnValue({ ok: true });
    mocks.respondDemoFriendRequest.mockReturnValue(true);
    mocks.removeDemoFriendship.mockReturnValue(true);
  });

  it("handles Nearby location opt-in and visibility without a Supabase mutation client", async () => {
    const location = new FormData();
    location.set("dogId", demoDogs[0].id);
    location.set("lat", "-33.4312");
    location.set("lng", "-70.6125");
    location.set("nearbyEnabled", "on");
    location.set("city", "Providencia");

    const saved = await saveDogLocationAction(initialActionState, location);

    const visibility = new FormData();
    visibility.set("dogId", demoDogs[0].id);
    visibility.set("nearbyEnabled", "on");
    const toggled = await toggleNearbyVisibilityAction(initialActionState, visibility);

    expect(saved.status).toBe("success");
    expect(toggled.status).toBe("success");
    expect(mocks.requireActionUser).not.toHaveBeenCalled();
  });

  it("creates and responds to demo playdates without a Supabase mutation client", async () => {
    const createForm = new FormData();
    createForm.set("hostDogId", demoDogs[0].id);
    createForm.set("invitedDogId", demoDogs[2].id);
    createForm.set("title", "Paseo de prueba demo");
    createForm.set("startsAt", "2026-09-03T15:00:00.000Z");
    createForm.set("city", "Santiago");
    createForm.set("locationLabel", "Parque Inés de Suárez");

    const created = await createPlaydateAction(initialActionState, createForm);

    const responseForm = new FormData();
    responseForm.set("playdateId", "p2222222-2222-4222-8222-222222222222");
    responseForm.set("dogId", demoDogs[0].id);
    responseForm.set("response", "accepted");
    const responded = await respondPlaydateInviteAction(initialActionState, responseForm);

    expect(created.status).toBe("success");
    expect(responded.status).toBe("success");
    expect(mocks.recordDemoPlaydate).toHaveBeenCalledOnce();
    expect(mocks.respondDemoPlaydate).toHaveBeenCalledOnce();
    expect(mocks.requireActionUser).not.toHaveBeenCalled();
  });

  it("creates a demo conversation and sends a demo message without Supabase writes", async () => {
    const conversation = await startConversationAction(demoDogs[0].id, demoDogs[2].id);

    const messageForm = new FormData();
    messageForm.set("conversationId", "c1111111-1111-4111-8111-111111111111");
    messageForm.set("senderDogId", demoDogs[0].id);
    messageForm.set("body", "¡Hola desde la demo!");
    const message = await sendMessageAction(initialActionState, messageForm);

    expect(conversation).toMatchObject({ success: true });
    expect(message.status).toBe("success");
    expect(mocks.getOrCreateDemoConversation).toHaveBeenCalledOnce();
    expect(mocks.recordDemoMessage).toHaveBeenCalledOnce();
    expect(mocks.requireActionUser).not.toHaveBeenCalled();
  });

  it("handles friendship send, response, and removal in the demo store only", async () => {
    const requestForm = new FormData();
    requestForm.set("requesterDogId", demoDogs[0].id);
    requestForm.set("recipientDogId", demoDogs[2].id);
    const request = await sendFriendRequestAction(initialActionState, requestForm);

    const responseForm = new FormData();
    responseForm.set("friendshipId", "dddddddd-7777-4777-8777-777777777777");
    responseForm.set("status", "accepted");
    await respondToFriendRequestAction(responseForm);

    const removalForm = new FormData();
    removalForm.set("friendshipId", "dddddddd-1111-4111-8111-111111111111");
    removalForm.set("dogId", demoDogs[0].id);
    await removeFriendshipAction(removalForm);

    expect(request.status).toBe("success");
    expect(mocks.recordDemoFriendRequest).toHaveBeenCalledOnce();
    expect(mocks.respondDemoFriendRequest).toHaveBeenCalledOnce();
    expect(mocks.removeDemoFriendship).toHaveBeenCalledOnce();
    expect(mocks.requireActionUser).not.toHaveBeenCalled();
  });

  it("accepts product and beta feedback as demo no-ops without Supabase writes", async () => {
    const productForm = new FormData();
    productForm.set("dogId", demoDogs[0].id);
    productForm.set("productId", demoProducts[0].id);
    productForm.set("reaction", "loved");
    productForm.set("rating", "5");
    const product = await saveProductFeedbackAction(initialActionState, productForm);

    const betaForm = new FormData();
    betaForm.set("message", "La demo social funciona muy bien.");
    betaForm.set("category", "Me gustó algo");
    const beta = await submitBetaFeedbackAction(initialActionState, betaForm);

    expect(product.status).toBe("success");
    expect(beta.status).toBe("success");
    expect(mocks.requireActionUser).not.toHaveBeenCalled();
  });
});
