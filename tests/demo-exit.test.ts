import { describe, expect, it } from "vitest";

import { POST } from "@/app/demo/exit/route";
import { DEMO_COOKIE } from "@/lib/demo-cookie";

describe("demo exit route", () => {
  it("clears demo mode only on an explicit POST", async () => {
    const response = await POST(new Request("https://doggy.example/demo/exit", { method: "POST" }));

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("https://doggy.example/sign-up");
    expect(response.cookies.get(DEMO_COOKIE)?.value).toBe("");
    expect(response.cookies.get(DEMO_COOKIE)?.maxAge).toBe(0);
  });
});
