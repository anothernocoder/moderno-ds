import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import postcss, { type Declaration, type Rule } from "postcss";

const tokensCss = readFileSync(
  fileURLToPath(new URL("../src/tokens.css", import.meta.url)),
  "utf8",
);
const presetCss = readFileSync(
  fileURLToPath(new URL("../src/preset.css", import.meta.url)),
  "utf8",
);

/** Semantic color slots every component may reference (shadcn-style contract). */
const COLOR_SLOTS = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "destructive-foreground",
  "border",
  "input",
  "ring",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
] as const;

const NON_COLOR_SLOTS = ["radius", "font-sans", "font-mono"] as const;

const EXTENDED_SLOTS = [
  "spacing-1",
  "spacing-2",
  "spacing-3",
  "spacing-4",
  "spacing-5",
  "spacing-6",
  "spacing-7",
  "spacing-8",
  "motion-instant",
  "motion-fast",
  "motion-normal",
  "radius",
  "radius-full",
] as const;

/** Parse a stylesheet into selector -> { customProp: value }. */
function declsBySelector(css: string): Map<string, Map<string, string>> {
  const root = postcss.parse(css);
  const out = new Map<string, Map<string, string>>();
  root.walkRules((rule: Rule) => {
    const map = out.get(rule.selector) ?? new Map<string, string>();
    rule.walkDecls((decl: Declaration) => {
      if (decl.prop.startsWith("--")) map.set(decl.prop.slice(2), decl.value);
    });
    out.set(rule.selector, map);
  });
  return out;
}

const tokenRules = declsBySelector(tokensCss);
const root = tokenRules.get(":root") ?? new Map<string, string>();
const dark = tokenRules.get(".dark") ?? new Map<string, string>();

describe("@moderno/tokens — minimum slot contract", () => {
  it("defines every color slot in :root with a non-empty value", () => {
    for (const slot of COLOR_SLOTS) {
      expect(root.get(slot), `--${slot} missing in :root`).toBeTruthy();
    }
  });

  it("defines the non-color slots (radius, font-sans, font-mono)", () => {
    for (const slot of NON_COLOR_SLOTS) {
      expect(root.get(slot), `--${slot} missing in :root`).toBeTruthy();
    }
  });

  it("expresses all color slots in OKLCH", () => {
    for (const slot of COLOR_SLOTS) {
      expect(root.get(slot), `--${slot}`).toMatch(/^oklch\(/);
    }
  });
});

describe("@moderno/tokens — extended contract", () => {
  it("defines spacing, motion and radius slots", () => {
    for (const slot of EXTENDED_SLOTS) {
      expect(root.get(slot), `--${slot} missing`).toBeTruthy();
    }
  });
});

describe("@moderno/tokens — dark variant", () => {
  it("redefines the core slots in .dark", () => {
    expect(tokenRules.has(".dark")).toBe(true);
    for (const slot of ["background", "foreground", "primary"]) {
      expect(dark.get(slot), `--${slot} not overridden in .dark`).toMatch(/^oklch\(/);
    }
  });
});

describe("@moderno/tokens — multi-brand", () => {
  it("ships a [data-brand] scope that remaps at least one contract slot", () => {
    const brandSelectors = [...tokenRules.keys()].filter((s) => s.includes("[data-brand"));
    expect(brandSelectors.length).toBeGreaterThan(0);
    const remapsContractSlot = brandSelectors.some((sel) => {
      const decls = tokenRules.get(sel)!;
      return [...COLOR_SLOTS].some((slot) => decls.has(slot));
    });
    expect(remapsContractSlot, "no [data-brand] scope overrides a contract slot").toBe(true);
  });

  it("re-maps WITHOUT touching the base tokens (override lives in its own scope)", () => {
    let realRemap = false;
    for (const [selector, decls] of tokenRules) {
      if (!selector.includes("[data-brand")) continue;
      // The brand scope must be distinct from the base :root.
      expect(selector).not.toBe(":root");
      for (const slot of COLOR_SLOTS) {
        if (!decls.has(slot)) continue;
        // Base :root still defines the slot — the brand overrides, never deletes.
        expect(root.get(slot), `base :root lost --${slot}`).toBeTruthy();
        if (decls.get(slot) !== root.get(slot)) realRemap = true;
      }
    }
    // At least one slot genuinely changes — proving the remap is effective.
    expect(realRemap, "no [data-brand] slot actually differs from the base").toBe(true);
  });
});

describe("@moderno/tokens — Tailwind v4 preset", () => {
  it("maps every color slot to a utility variable via @theme inline", () => {
    expect(presetCss).toMatch(/@theme\s+inline/);
    for (const slot of COLOR_SLOTS) {
      const re = new RegExp(`--color-${slot}:\\s*var\\(--${slot}\\)`);
      expect(presetCss, `--color-${slot} not mapped`).toMatch(re);
    }
  });

  it("maps the font slots to Tailwind font variables", () => {
    expect(presetCss).toMatch(/--font-sans:\s*var\(--font-sans\)/);
    expect(presetCss).toMatch(/--font-mono:\s*var\(--font-mono\)/);
  });
});
