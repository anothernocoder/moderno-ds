import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { compile } from "tailwindcss";
import { beforeAll, describe, expect, it } from "vitest";

/**
 * Integration test for F0.5: the Tailwind v4 preset must make utilities resolve
 * to the contract variables, so a runtime override of `--<slot>` re-themes
 * without a rebuild. We actually run the v4 compiler over the real preset and
 * inspect the generated utility CSS — not just the preset source text.
 */

const require = createRequire(import.meta.url);
const presetCss = readFileSync(
  fileURLToPath(new URL("../src/preset.css", import.meta.url)),
  "utf8",
);

let utilities: string;

beforeAll(async () => {
  const input = `@import "tailwindcss";\n${presetCss}`;
  const compiled = await compile(input, {
    base: process.cwd(),
    loadStylesheet: async () => {
      const path = require.resolve("tailwindcss/index.css");
      return { base: dirname(path), path, content: readFileSync(path, "utf8") };
    },
    loadModule: async () => {
      throw new Error("preset must not require JS modules");
    },
  });
  utilities = compiled.build([
    "bg-primary",
    "text-foreground",
    "border-border",
    "ring-ring",
    "bg-chart-1",
    "rounded-lg",
    "font-sans",
    "font-mono",
  ]);
});

describe("@moderno/tokens preset — generated utilities resolve to contract vars", () => {
  it("emits color utilities that reference var(--slot), enabling runtime override", () => {
    expect(utilities).toContain("var(--primary)");
    expect(utilities).toContain("var(--foreground)");
    expect(utilities).toContain("var(--border)");
    expect(utilities).toContain("var(--ring)");
    expect(utilities).toContain("var(--chart-1)");
  });

  it("emits .bg-primary backed by var(--primary), not a copied value", () => {
    expect(utilities).toMatch(/\.bg-primary\s*\{[^}]*var\(--primary\)/s);
  });

  it("registers font utilities (the inline @theme font mapping is required, not a no-op)", () => {
    expect(utilities).toMatch(/\.font-sans\s*\{[^}]*var\(--font-sans\)/s);
    expect(utilities).toMatch(/\.font-mono\s*\{[^}]*var\(--font-mono\)/s);
  });

  it("derives radius utilities from the contract --radius", () => {
    expect(utilities).toMatch(/\.rounded-lg\s*\{[^}]*var\(--radius\)/s);
  });
});
