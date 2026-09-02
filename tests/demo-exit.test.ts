import { describe, expect, it } from "vitest";

import { POST } from "@/app/demo/exit/route";
import { DEMO_COOKIE, DEMO_COOKIE_CLEAR_OPTIONS, DEMO_COOKIE_OPTIONS } from "@/lib/demo-cookie";

describe("demo exit route", () => {
  it("clears demo mode only on an explicit POST using the original cookie attributes", async () => {
    const response = await POST(new Request("https://doggy.example/demo/exit", { method: "POST" }));
    const cleared = response.cookies.get(DEMO_COOKIE);

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("https://doggy.example/sign-up");
    expect(cleared?.value).toBe("");
    expect(cleared?.maxAge).toBe(0);
    expect(cleared?.path).toBe(DEMO_COOKIE_OPTIONS.path);
    expect(cleared?.httpOnly).toBe(DEMO_COOKIE_OPTIONS.httpOnly);
    expect(cleared?.sameSite).toBe(DEMO_COOKIE_OPTIONS.sameSite);
    expect(cleared?.secure).toBe(DEMO_COOKIE_CLEAR_OPTIONS.secure);
  });
});
