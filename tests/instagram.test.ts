import { describe, expect, it } from "vitest";

import { normalizeInstagramHandle } from "@/lib/validation";

describe("Instagram Profile Field", () => {
  it("normalizes handles with leading @ symbol", () => {
    expect(normalizeInstagramHandle("@rockythegolden")).toBe("rockythegolden");
    expect(normalizeInstagramHandle("@@rocky")).toBe("rocky");
  });

  it("normalizes handles from pasted Instagram URLs", () => {
    expect(normalizeInstagramHandle("https://instagram.com/rockythegolden")).toBe("rockythegolden");
    expect(normalizeInstagramHandle("https://www.instagram.com/luna.pup/")).toBe("luna.pup");
    expect(normalizeInstagramHandle("http://instagram.com/doggy_123/")).toBe("doggy_123");
  });

  it("trims whitespace", () => {
    expect(normalizeInstagramHandle("  @rocky  ")).toBe("rocky");
    expect(normalizeInstagramHandle("   ")).toBeNull();
    expect(normalizeInstagramHandle("")).toBeNull();
  });

  it("handles null or undefined safely", () => {
    expect(normalizeInstagramHandle(null)).toBeNull();
    expect(normalizeInstagramHandle(undefined)).toBeNull();
  });
});
