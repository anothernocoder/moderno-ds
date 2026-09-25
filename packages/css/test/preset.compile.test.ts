import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";
import { compile } from "tailwindcss";
import { beforeAll, describe, expect, it } from "vitest";
import { FONT_WEIGHTS } from "../src/contract.ts";

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
const tokensCss = readFileSync(
  fileURLToPath(new URL("../src/tokens.css", import.meta.url)),
  "utf8",
);

function compileCss(input: string) {
  return compile(input, {
    base: process.cwd(),
    loadStylesheet: async () => {
      const path = require.resolve("tailwindcss/index.css");
      return { base: dirname(path), path, content: readFileSync(path, "utf8") };
    },
    loadModule: async () => {
      throw new Error("preset must not require JS modules");
    },
  });
}

/** The value a stylesheet gives `--<name>`, or undefined. */
function customProp(css: string, name: string): string | undefined {
  return css.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1]?.trim();
}

/** `.font-<weight> { … font-weight: var(--font-weight-<weight>) … }` */
const weightRule = (weight: string) =>
  new RegExp(`\\.font-${weight}\\s*\\{[^}]*font-weight:\\s*var\\(--font-weight-${weight}\\)`, "s");

const WEIGHT_UTILITIES = [...FONT_WEIGHTS.map((w) => `font-${w}`), "font-light"];

let utilities: string;
/** Stock Tailwind with no preset: what a registry block's `font-medium` compiles to. */
let stock: string;

beforeAll(async () => {
  stock = (await compileCss(`@import "tailwindcss";`)).build(WEIGHT_UTILITIES);
  const compiled = await compileCss(`@import "tailwindcss";\n${presetCss}`);
  utilities = compiled.build([
    ...WEIGHT_UTILITIES,
    "bg-primary",
    "text-foreground",
    "border-border",
    "ring-ring",
    "bg-chart-1",
    "bg-overlay",
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
    "text-ui-sm",
    "text-heading",
    "leading-body",
    "text-sm",
    // Keys the contract does not define: Tailwind ships them, the reset drops
    // them. Asked for here so their absence from the output is a real assertion.
    "max-w-xl",
    "max-w-2xl",
    "max-w-xs",
    "@xl:flex",
  ]);
});

describe("@moderno-ui/css preset — generated utilities resolve to contract vars", () => {
  it("emits color utilities that reference var(--slot), enabling runtime override", () => {
    expect(utilities).toContain("var(--primary)");
    expect(utilities).toContain("var(--foreground)");
    expect(utilities).toContain("var(--border)");
    expect(utilities).toContain("var(--ring)");
    expect(utilities).toContain("var(--chart-1)");
    expect(utilities).toMatch(/\.bg-overlay\s*\{[^}]*var\(--overlay\)/s);
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

  it("emits type utilities backed by the scale slots, size and line height together", () => {
    expect(utilities).toMatch(
      /\.text-ui-sm\s*\{[^}]*font-size:\s*var\(--text-ui-sm\)[^}]*var\(--leading-ui-sm\)/s,
    );
    expect(utilities).toMatch(
      /\.text-heading\s*\{[^}]*font-size:\s*var\(--text-heading\)[^}]*var\(--leading-heading\)/s,
    );
    expect(utilities).toMatch(/\.leading-body\s*\{[^}]*var\(--leading-body\)/s);
  });

  it("leaves Tailwind's stock text sizes alone", () => {
    expect(utilities).toMatch(/\.text-sm\s*\{[^}]*font-size:\s*var\(--text-sm\)/s);
    expect(utilities).not.toMatch(/\.text-sm\s*\{[^}]*--text-ui/s);
  });

  it("emits weight utilities backed by the weight slots", () => {
    for (const weight of FONT_WEIGHTS) {
      expect(utilities, `.font-${weight}`).toMatch(weightRule(weight));
    }
    // A weight the contract does not name keeps Tailwind's own value.
    expect(customProp(utilities, "font-weight-light")).toBe("300");
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

/**
 * The weight slots reuse Tailwind's own `--font-weight-*` keys on purpose. A
 * stock `font-semibold` already reads `var(--font-weight-semibold)`, and the
 * unlayered `:root` in tokens.css beats the default Tailwind puts in
 * `@layer theme`. So a registry block written with stock classes follows a
 * theme's weights with no preset and no migration, and renders exactly as
 * before when no theme overrides them: the neutral defaults are Tailwind's.
 */
describe("@moderno-ui/css — weight slots take over stock Tailwind weights", () => {
  it("stock font-* utilities already read the contract's slot names", () => {
    for (const weight of FONT_WEIGHTS) {
      expect(stock, `.font-${weight}`).toMatch(weightRule(weight));
    }
  });

  it("Tailwind declares its defaults in @layer theme, which tokens.css (unlayered) beats", () => {
    const themeLayer = stock.match(/@layer theme\s*\{[\s\S]*?\n\}/)?.[0] ?? "";
    for (const weight of FONT_WEIGHTS) {
      expect(themeLayer, `--font-weight-${weight}`).toContain(`--font-weight-${weight}:`);
    }
    const layered: string[] = [];
    postcss.parse(tokensCss).walkAtRules("layer", (rule) => void layered.push(rule.params));
    expect(layered, "tokens.css must stay unlayered to beat @layer theme").toEqual([]);
  });

  it("the tokens.css defaults are Tailwind's own values, so nothing changes visually", () => {
    for (const weight of FONT_WEIGHTS) {
      const slot = `font-weight-${weight}`;
      expect(customProp(stock, slot), `Tailwind's --${slot}`).toBeTruthy();
      expect(customProp(tokensCss, slot), `tokens.css --${slot}`).toBe(customProp(stock, slot));
    }
  });
});
