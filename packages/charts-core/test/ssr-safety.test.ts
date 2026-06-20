import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { createLinearScale, linePath } from "../src/index.js";

const srcDir = fileURLToPath(new URL("../src", import.meta.url));
const pkg = JSON.parse(
  readFileSync(fileURLToPath(new URL("../package.json", import.meta.url)), "utf8"),
) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };

const FORBIDDEN = ["d3-selection", "d3-transition"] as const;

function readSrc(dir: string): string {
  return readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const path = `${dir}/${entry.name}`;
      if (entry.isDirectory()) return readSrc(path);
      return entry.name.endsWith(".ts") ? [readFileSync(path, "utf8")] : [];
    })
    .join("\n");
}

describe("@moderno/charts-core — SSR safety (F1.3)", () => {
  it("runs without any DOM global present", () => {
    expect("document" in globalThis).toBe(false);
    expect("window" in globalThis).toBe(false);
  });

  it("produces scales and paths in a pure Node context (no DOM touched)", () => {
    const scale = createLinearScale({ domain: [0, 1], range: [0, 100] });
    expect(scale(0.5)).toBe(50);
    expect(linePath([{ x: 0, y: 0 }], { x: (p) => p.x, y: (p) => p.y })).toBe("M0,0Z");
  });
});

describe("@moderno/charts-core — forbidden d3 modules (F1.4)", () => {
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

  it("does not declare d3-selection or d3-transition as dependencies", () => {
    for (const mod of FORBIDDEN) {
      expect(allDeps, `${mod} must not be a dependency`).not.toHaveProperty(mod);
    }
  });

  it("never imports d3-selection or d3-transition in source", () => {
    const source = readSrc(srcDir);
    for (const mod of FORBIDDEN) {
      // Match real import/export specifiers, not prose mentions in comments.
      const specifier = new RegExp(`from\\s+["']${mod}["']`);
      expect(specifier.test(source), `${mod} imported in source`).toBe(false);
    }
  });

  it("keeps them out of the whole dependency tree (lockfile, incl. transitive)", () => {
    // F1.4 / DoD say "no import in the dependency tree" — assert against the
    // resolved lockfile so a transitive pull (e.g. via a d3 meta-package) fails
    // here, not just a direct dependency on charts-core.
    const lockfile = readFileSync(
      fileURLToPath(new URL("../../../pnpm-lock.yaml", import.meta.url)),
      "utf8",
    );
    for (const mod of FORBIDDEN) {
      const entry = new RegExp(`(^|/)${mod}@`, "m");
      expect(entry.test(lockfile), `${mod} present in the dependency tree`).toBe(false);
    }
  });
});
