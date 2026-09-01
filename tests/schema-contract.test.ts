// @vitest-environment node

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  join(process.cwd(), "supabase/migrations/20260901000000_initial_doggy_world.sql"),
  "utf8",
);

describe("database security contract", () => {
  it.each([
    "profiles",
    "dogs",
    "dog_preferences",
    "products",
    "dog_product_interactions",
    "dog_friendships",
  ])("enables RLS on %s", (table) => {
    expect(migration).toContain(`alter table public.${table} enable row level security`);
  });

  it("enforces symmetric uniqueness and prevents self-friendship", () => {
    expect(migration).toContain("constraint dog_friendships_not_self");
    expect(migration).toContain("least(requester_dog_id, recipient_dog_id)");
    expect(migration).toContain("greatest(requester_dog_id, recipient_dog_id)");
  });

  it("keeps product interaction rows private while exposing a narrow favorites RPC", () => {
    expect(migration).toContain('create policy "interactions_select_for_owned_dog"');
    expect(migration).not.toMatch(
      /create policy "[^"]*"\s+on public\.dog_product_interactions for select\s+to anon/,
    );
    expect(migration).toContain("get_public_dog_favorites");
    expect(migration).toContain("security definer");
  });

  it("uses a private constrained storage bucket with owner-scoped writes", () => {
    expect(migration).toContain("'dog-photos'");
    expect(migration).toContain("3145728");
    expect(migration).toContain("false,");
    expect(migration).toContain('create policy "dog_photos_insert_own_folder"');
    expect(migration).toContain("(storage.foldername(name))[1] = (select auth.uid())::text");
  });
});
