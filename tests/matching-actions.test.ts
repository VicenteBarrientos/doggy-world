// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getViewer: vi.fn(),
  recordDemoMatchAction: vi.fn(),
  requireActionUser: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("@/lib/data/viewer", () => ({
  getViewer: mocks.getViewer,
}));

vi.mock("@/lib/data/matching", () => ({
  recordDemoMatchAction: mocks.recordDemoMatchAction,
}));

vi.mock("@/lib/action-helpers", () => ({
  actionMessage: (error: unknown) =>
    error instanceof Error ? error.message : "Ocurrió un error inesperado.",
  requireActionUser: mocks.requireActionUser,
  stringValue: (formData: FormData, key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value : "";
  },
}));

import { recordMatchAction } from "@/app/actions/matching";
import { demoDogs } from "@/lib/demo-data";
import { initialActionState } from "@/lib/forms";

function matchForm(action: "like" | "pass", toDogId = demoDogs[2].id) {
  const formData = new FormData();
  formData.set("fromDogId", demoDogs[0].id);
  formData.set("toDogId", toDogId);
  formData.set("action", action);
  return formData;
}

function demoViewer() {
  return {
    id: demoDogs[0].owner_id,
    email: "demo@doggy.world",
    profile: {},
    isDemo: true,
  };
}

function createSupabaseDouble({ owned = true, mutual = false } = {}) {
  const dogQuery: Record<string, ReturnType<typeof vi.fn>> = {};
  dogQuery.select = vi.fn(() => dogQuery);
  dogQuery.eq = vi.fn(() => dogQuery);
  dogQuery.maybeSingle = vi.fn().mockResolvedValue({
    data: owned ? { id: demoDogs[0].id, owner_id: "real-owner" } : null,
  });

  const matchQuery: Record<string, ReturnType<typeof vi.fn>> = {};
  matchQuery.select = vi.fn(() => matchQuery);
  matchQuery.eq = vi.fn(() => matchQuery);
  matchQuery.maybeSingle = vi.fn().mockResolvedValue({
    data: mutual ? { id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb" } : null,
  });

  const upsert = vi.fn().mockResolvedValue({ error: null });
  const from = vi.fn((table: string) => {
    if (table === "dogs") return dogQuery;
    if (table === "dog_match_actions") return { upsert };
    if (table === "dog_matches") return matchQuery;
    throw new Error(`Unexpected table ${table}`);
  });

  return { supabase: { from }, from, upsert };
}

describe("recordMatchAction demo and real-user boundaries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getViewer.mockResolvedValue(demoViewer());
    mocks.recordDemoMatchAction.mockReturnValue(false);
  });

  it("lets explicit demo pass succeed without acquiring a Supabase action client", async () => {
    const result = await recordMatchAction(
      initialActionState,
      matchForm("pass", demoDogs[3].id),
    );

    expect(result).toMatchObject({ status: "success", isMutualMatch: false });
    expect(mocks.recordDemoMatchAction).toHaveBeenCalledWith(
      demoDogs[0].id,
      demoDogs[3].id,
      "pass",
    );
    expect(mocks.requireActionUser).not.toHaveBeenCalled();
  });

  it("lets explicit demo like succeed without acquiring a Supabase action client", async () => {
    const result = await recordMatchAction(initialActionState, matchForm("like"));

    expect(result).toMatchObject({ status: "success", isMutualMatch: false });
    expect(mocks.recordDemoMatchAction).toHaveBeenCalledWith(
      demoDogs[0].id,
      demoDogs[2].id,
      "like",
    );
    expect(mocks.requireActionUser).not.toHaveBeenCalled();
  });

  it("returns a successful synthetic mutual match in demo mode", async () => {
    mocks.recordDemoMatchAction.mockReturnValue(true);

    const result = await recordMatchAction(initialActionState, matchForm("like"));

    expect(result).toMatchObject({
      status: "success",
      message: "¡Hicieron Match!",
      isMutualMatch: true,
    });
    expect(mocks.requireActionUser).not.toHaveBeenCalled();
  });

  it("persists a real authenticated Match action to Supabase", async () => {
    const database = createSupabaseDouble();
    mocks.getViewer.mockResolvedValue({ ...demoViewer(), id: "real-owner", isDemo: false });
    mocks.requireActionUser.mockResolvedValue({
      supabase: database.supabase,
      user: { id: "real-owner" },
    });

    const result = await recordMatchAction(initialActionState, matchForm("like"));

    expect(result.status).toBe("success");
    expect(database.upsert).toHaveBeenCalledWith(
      {
        from_dog_id: demoDogs[0].id,
        to_dog_id: demoDogs[2].id,
        action: "like",
      },
      { onConflict: "from_dog_id,to_dog_id" },
    );
    expect(database.from).toHaveBeenCalledWith("dog_match_actions");
    expect(mocks.recordDemoMatchAction).not.toHaveBeenCalled();
  });

  it("rejects a real user acting for another owner's dog before any Match write", async () => {
    const database = createSupabaseDouble({ owned: false });
    mocks.getViewer.mockResolvedValue({ ...demoViewer(), id: "real-owner", isDemo: false });
    mocks.requireActionUser.mockResolvedValue({
      supabase: database.supabase,
      user: { id: "real-owner" },
    });

    const result = await recordMatchAction(initialActionState, matchForm("pass"));

    expect(result).toMatchObject({
      status: "error",
      message: "No tienes permisos para actuar con este perro.",
    });
    expect(database.upsert).not.toHaveBeenCalled();
    expect(database.from).not.toHaveBeenCalledWith("dog_match_actions");
  });
});
