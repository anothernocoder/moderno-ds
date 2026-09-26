import { describe, expect, it } from "vitest";

/*
 * The package's runtime export surface, pinned. `index.ts` re-exports the
 * generated recipe barrel wholesale, so nothing else would notice a recipe
 * file that adds, renames or drops an export. A change that means to alter the
 * surface updates the snapshot (`pnpm vitest run packages/core/test/exports.test.ts -u`)
 * and the reviewer sees exactly which names moved.
 */
describe("@moderno-ui/core exports", () => {
  it("exports exactly the pinned names", async () => {
    const names = Object.keys(await import("../src/index.js")).sort();
    expect(names).toMatchSnapshot();
  });
});
