import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const indexCss = readFileSync(fileURLToPath(new URL("../src/index.css", import.meta.url)), "utf8");
const presetCss = readFileSync(
  fileURLToPath(new URL("../src/preset.css", import.meta.url)),
  "utf8",
);
const pkg = JSON.parse(
  readFileSync(fileURLToPath(new URL("../package.json", import.meta.url)), "utf8"),
) as { exports: Record<string, string>; dependencies?: Record<string, string> };

describe("@moderno-ui/css — public entrypoint", () => {
  it("brings the token contract's neutral defaults from its own tokens.css", () => {
    expect(indexCss).toMatch(/@import\s+["']\.\/tokens\.css["']/);
  });

  it("brings the @moderno-ui/core component stylesheet (Phase 1, F1.5)", () => {
    expect(indexCss).toMatch(/@import\s+["']@moderno-ui\/core\/styles\/components\.css["']/);
  });

  it("never leaks internal package paths (dist/, node_modules, src/)", () => {
    for (const css of [indexCss, presetCss]) {
      expect(css).not.toMatch(/dist\//);
      expect(css).not.toMatch(/node_modules/);
      expect(css).not.toMatch(/\/src\//);
    }
  });
});

describe("@moderno-ui/css — package surface", () => {
  it("exports the stylesheet, the variables alone and their DTCG source, the preset, the contract and the agent manifest", () => {
    expect(Object.keys(pkg.exports).sort()).toEqual(
      [
        ".",
        "./contract",
        "./moderno.agent.json",
        "./package.json",
        "./preset",
        "./tokens.css",
        "./tokens.dtcg.json",
      ].sort(),
    );
  });

  it("points every export at a file the package ships", () => {
    for (const [subpath, target] of Object.entries(pkg.exports)) {
      if (target.startsWith("./dist/")) continue; // written by the build
      const file = fileURLToPath(new URL(`../${target}`, import.meta.url));
      expect(() => readFileSync(file), `${subpath} → ${target}`).not.toThrow();
    }
  });
});
