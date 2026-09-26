import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import coreRecipes from "../../src/aggregators/core-recipes.ts";

let root: string;
beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "moderno-gen-core-recipes-"));
  mkdirSync(join(root, "packages/core/src/recipes"), { recursive: true });
});
afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

function addRecipe(slug: string): void {
  writeFileSync(join(root, "packages/core/src/recipes", `${slug}.ts`), "export {};\n");
}

describe("core-recipes aggregator", () => {
  it("writes core's recipe barrel from the recipe folder", () => {
    expect(coreRecipes.output).toBe("packages/core/src/recipes.ts");
    expect(coreRecipes.source).toBe("packages/core/src/recipes/*.ts");
  });

  it("re-exports every recipe file, sorted by slug", () => {
    addRecipe("toggle-group");
    addRecipe("button");
    addRecipe("toggle");

    const body = coreRecipes.generate({ root, outputs: [] });
    const exports = body.split("\n").filter((line) => line.startsWith("export"));
    expect(exports).toEqual([
      'export * from "./recipes/button.js";',
      'export * from "./recipes/toggle.js";',
      'export * from "./recipes/toggle-group.js";',
    ]);
  });

  it("ignores files that are not TypeScript modules", () => {
    addRecipe("button");
    writeFileSync(join(root, "packages/core/src/recipes", "README.md"), "# notes\n");

    const body = coreRecipes.generate({ root, outputs: [] });
    expect(body).not.toContain("README");
  });
});
