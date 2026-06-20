import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const indexCss = readFileSync(fileURLToPath(new URL("../src/index.css", import.meta.url)), "utf8");
const presetCss = readFileSync(
  fileURLToPath(new URL("../src/preset.css", import.meta.url)),
  "utf8",
);

describe("@moderno/css — public entrypoint", () => {
  it("re-exports the token contract via the package subpath", () => {
    expect(indexCss).toMatch(/@import\s+["']@moderno\/tokens\/css["']/);
  });

  it("forwards the Tailwind preset via the package subpath", () => {
    expect(presetCss).toMatch(/@import\s+["']@moderno\/tokens\/preset["']/);
  });

  it("never leaks internal package paths (dist/, node_modules, src/)", () => {
    for (const css of [indexCss, presetCss]) {
      expect(css).not.toMatch(/dist\//);
      expect(css).not.toMatch(/node_modules/);
      expect(css).not.toMatch(/\/src\//);
    }
  });
});
