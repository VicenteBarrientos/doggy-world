// @vitest-environment node

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("Next.js Server Action module contract", () => {
  it("exports no runtime values other than async functions from use-server files", () => {
    const actionsDirectory = join(process.cwd(), "src", "app", "actions");
    const invalidExports: string[] = [];

    for (const fileName of readdirSync(actionsDirectory).filter((file) => file.endsWith(".ts"))) {
      const source = readFileSync(join(actionsDirectory, fileName), "utf8");
      if (!source.startsWith('"use server"') && !source.startsWith("'use server'")) continue;

      const matches = source.match(/^export\s+(?:const|let|var|class|function)\b/gm) ?? [];
      if (matches.length) invalidExports.push(fileName);
    }

    expect(invalidExports).toEqual([]);
  });
});
