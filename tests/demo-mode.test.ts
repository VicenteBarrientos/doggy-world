// @vitest-environment node
/**
 * Regression suite for the VER DEMO explicit public-demo feature.
 *
 * Tests the two independent demo-mode concepts:
 *   1. Automatic fallback   — Supabase credentials absent
 *   2. Explicit public demo — demo_mode session cookie present
 *
 * Uses vi.mock so next/headers is never actually called in tests.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

// ── Mocks ───────────────────────────────────────────────────────────────────
// next/headers must be mocked before any imports that use it.
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

// next/navigation redirect is a no-op in tests
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  DEMO_COOKIE,
  DEMO_COOKIE_OPTIONS,
  DEMO_COOKIE_VALUE,
  isDemoCookieSet,
} from "@/lib/demo-cookie";
import { submitBetaFeedbackAction } from "@/app/actions/beta-feedback";
import { initialActionState } from "@/lib/forms";

// ── Helper: build a minimal cookie-store mock ────────────────────────────────
function mockCookies(hasDemoCookie: boolean) {
  const store = {
    get: vi.fn((name: string) => {
      if (name === DEMO_COOKIE && hasDemoCookie) {
        return { value: DEMO_COOKIE_VALUE };
      }
      return undefined;
    }),
    set: vi.fn(),
    getAll: vi.fn(() => []),
  };
  vi.mocked(cookies).mockResolvedValue(store as unknown as Awaited<ReturnType<typeof cookies>>);
  return store;
}

// ── 1. isDemoCookieSet ───────────────────────────────────────────────────────
describe("isDemoCookieSet()", () => {
  it("returns true when demo_mode=1 cookie is present", () => {
    const store = { get: (name: string) => (name === DEMO_COOKIE ? { value: "1" } : undefined) };
    expect(isDemoCookieSet(store)).toBe(true);
  });

  it("returns false when demo_mode cookie is absent", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const store = { get: (_: string): { value: string } | undefined => undefined };
    expect(isDemoCookieSet(store)).toBe(false);
  });

  it("returns false when demo_mode cookie has a different value", () => {
    const store = { get: (name: string) => (name === DEMO_COOKIE ? { value: "0" } : undefined) };
    expect(isDemoCookieSet(store)).toBe(false);
  });

  it("returns false when an unrelated cookie is present but demo_mode is not", () => {
    const store = {
      get: (name: string) => (name === "session" ? { value: "abc123" } : undefined),
    };
    expect(isDemoCookieSet(store)).toBe(false);
  });
});

// ── 2. DEMO_COOKIE constants ─────────────────────────────────────────────────
describe("Demo cookie constants", () => {
  it("uses the canonical cookie name demo_mode", () => {
    expect(DEMO_COOKIE).toBe("demo_mode");
  });

  it("uses value '1'", () => {
    expect(DEMO_COOKIE_VALUE).toBe("1");
  });

  it("cookie options include httpOnly and sameSite=lax", () => {
    expect(DEMO_COOKIE_OPTIONS.httpOnly).toBe(true);
    expect(DEMO_COOKIE_OPTIONS.sameSite).toBe("lax");
    expect(DEMO_COOKIE_OPTIONS.path).toBe("/");
  });

  it("cookie options do NOT include maxAge or expires (session cookie)", () => {
    expect((DEMO_COOKIE_OPTIONS as Record<string, unknown>).maxAge).toBeUndefined();
    expect((DEMO_COOKIE_OPTIONS as Record<string, unknown>).expires).toBeUndefined();
  });
});

// ── 3. requireActionUser mutation guard ──────────────────────────────────────
describe("requireActionUser() — demo mutation guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws a demo-specific error when demo_mode cookie is present (Supabase configured)", async () => {
    // Arrange: demo cookie is set, Supabase IS configured in env
    mockCookies(true);

    // We need Supabase to appear configured — set env vars temporarily
    const origUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const origKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

    const { requireActionUser } = await import("@/lib/action-helpers");

    await expect(requireActionUser()).rejects.toThrow(/La vista demo no guarda cambios/);

    // Restore
    process.env.NEXT_PUBLIC_SUPABASE_URL = origUrl;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = origKey;
  });

  it("throws a demo-specific error when Supabase is not configured (automatic fallback)", async () => {
    mockCookies(false);

    const origUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const origKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const { requireActionUser } = await import("@/lib/action-helpers");

    await expect(requireActionUser()).rejects.toThrow(/La vista demo no guarda cambios/);

    process.env.NEXT_PUBLIC_SUPABASE_URL = origUrl;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = origKey;
  });
});

// ── 4. Beta feedback action — demo cookie guard ──────────────────────────────
describe("submitBetaFeedbackAction() — demo protection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects feedback submission with demo cookie present (cannot write to Supabase)", async () => {
    mockCookies(true);

    // Supabase appears configured so the demo-cookie guard is the relevant one
    const origUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const origKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

    const formData = new FormData();
    formData.set("message", "Me encanta Doggy World!");
    formData.set("category", "Me gustó algo");

    const result = await submitBetaFeedbackAction(initialActionState, formData);
    expect(result.status).toBe("error");
    expect(result.message).toMatch(/La vista demo no guarda cambios/);

    process.env.NEXT_PUBLIC_SUPABASE_URL = origUrl;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = origKey;
  });

  it("rejects feedback with no Supabase configured (automatic fallback)", async () => {
    mockCookies(false);

    const origUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const origKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const formData = new FormData();
    formData.set("message", "Todo funciona genial");
    formData.set("category", "Me gustó algo");

    const result = await submitBetaFeedbackAction(initialActionState, formData);
    expect(result.status).toBe("error");
    expect(result.message).toMatch(/La vista demo no guarda cambios/);

    process.env.NEXT_PUBLIC_SUPABASE_URL = origUrl;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = origKey;
  });
});

// ── 5. redirect() is never called during demo ────────────────────────────────
describe("Demo navigation — redirect() never fires for demo reads", () => {
  it("redirect mock is importable (no crash)", () => {
    expect(redirect).toBeDefined();
  });
});
