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
    "font-serif",
    "shadow-sm",
    "shadow-md",
    "shadow-lg",
    "max-w-sm",
    "max-w-md",
    "w-lg",
    "@sm:flex",
    "@md:grid",
    "@lg:block",
    // Keys the contract does not define: Tailwind ships them, the reset drops
    // them. Asked for here so their absence from the output is a real assertion.
    "max-w-xl",
    "max-w-2xl",
    "max-w-xs",
    "@xl:flex",
  ]);
});

describe("@moderno-ui/tokens preset — generated utilities resolve to contract vars", () => {
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
    expect(utilities).toMatch(/\.font-serif\s*\{[^}]*var\(--font-serif\)/s);
  });

  it("derives radius utilities from the contract --radius", () => {
    expect(utilities).toMatch(/\.rounded-lg\s*\{[^}]*var\(--radius\)/s);
  });

  it("emits shadow utilities backed by the elevation slots, not copied values", () => {
    for (const step of ["sm", "md", "lg"]) {
      expect(utilities, `.shadow-${step}`).toMatch(
        new RegExp(`\\.shadow-${step}\\s*\\{[^}]*var\\(--shadow-${step}\\)`, "s"),
      );
    }
  });

  /**
   * The two halves of the container mapping, which is why it is not `inline`:
   * the width utilities must stay runtime-themeable, while the container-query
   * variants must carry a literal length — `@container (width >= var(…))` never
   * matches, so an inline mapping would silently drop every `@sm:` utility.
   */
  it("keeps container width utilities pointed at var(--container-*)", () => {
    expect(utilities).toMatch(/\.max-w-sm\s*\{[^}]*var\(--container-sm\)/s);
    expect(utilities).toMatch(/\.max-w-md\s*\{[^}]*var\(--container-md\)/s);
    expect(utilities).toMatch(/\.w-lg\s*\{[^}]*var\(--container-lg\)/s);
  });

  it("emits @sm/@md/@lg container-query variants at the contract widths", () => {
    expect(utilities).toContain("@container (width >= 24rem)");
    expect(utilities).toContain("@container (width >= 36rem)");
    expect(utilities).toContain("@container (width >= 48rem)");
  });

  /**
   * `--container-*` is Tailwind's own namespace, and the contract's three steps
   * are not its values (`md` 28rem, `lg` 32rem, `xl` 36rem…). The preset resets
   * the namespace instead of overriding three keys inside it, so the scale it
   * leaves behind is ordered: without the reset `max-w-lg` (48rem) would be
   * wider than `max-w-xl` (36rem) and `@lg:` would fire after `@xl:`.
   */
  it("owns the container namespace: exactly the three contract steps, nothing else", () => {
    // Tailwind's own container keys are in the build list above; after the reset
    // no utility comes back for them, so `max-w-lg` can never end up wider than
    // `max-w-xl` and `@lg:` can never fire later than `@xl:`.
    expect(utilities).not.toMatch(/\.max-w-xl\s*\{/);
    expect(utilities).not.toMatch(/\.max-w-2xl\s*\{/);
    expect(utilities).not.toMatch(/\.max-w-xs\s*\{/);
    expect(utilities, "the @xl: variant must not exist either").not.toContain("@xl");
    expect(utilities).not.toContain("--container-xl");
  });

  it("leaves an ordered scale: the only container thresholds are the contract's", () => {
    const thresholds = [...utilities.matchAll(/@container \(width >= ([\d.]+)rem\)/g)].map((m) =>
      Number(m[1]),
    );
    expect(thresholds.length).toBeGreaterThan(0);
    expect([...new Set(thresholds)].sort((a, b) => a - b)).toEqual([24, 36, 48]);
  });
});
