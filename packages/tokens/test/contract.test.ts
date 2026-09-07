import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import postcss, { type AtRule, type Declaration, type Rule } from "postcss";
import {
  COLOR_GROUPS,
  COLOR_SLOTS,
  CONTRACT,
  CONTRAST_PAIRS,
  EXTENDED_SLOTS,
  OTHER_SLOTS,
  slotType,
} from "../src/contract.ts";

const tokensCss = readFileSync(
  fileURLToPath(new URL("../src/tokens.css", import.meta.url)),
  "utf8",
);
const presetCss = readFileSync(
  fileURLToPath(new URL("../src/preset.css", import.meta.url)),
  "utf8",
);

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

/** Custom properties declared in `@theme <params>` blocks of a stylesheet. */
function themeBlockDecls(css: string, params: string): Map<string, string> {
  const out = new Map<string, string>();
  postcss.parse(css).walkAtRules("theme", (rule: AtRule) => {
    if (rule.params.trim() !== params) return;
    rule.walkDecls((decl: Declaration) => {
      if (decl.prop.startsWith("--")) out.set(decl.prop.slice(2), decl.value);
    });
  });
  return out;
}

const tokenRules = declsBySelector(tokensCss);
const root = tokenRules.get(":root") ?? new Map<string, string>();
const dark = tokenRules.get(".dark") ?? new Map<string, string>();

describe("@moderno-ui/tokens — contract data", () => {
  it("splits every slot into exactly one derived list", () => {
    const derived = [...COLOR_SLOTS, ...OTHER_SLOTS, ...EXTENDED_SLOTS];
    expect(new Set(derived).size).toBe(derived.length);
    expect(derived.sort()).toEqual(CONTRACT.map((s) => s.name).sort());
  });

  it("groups every colour slot for the editor, in contract order", () => {
    const grouped = COLOR_GROUPS.flatMap((g) => g.slots);
    expect(grouped).toEqual([...COLOR_SLOTS]);
  });

  it("pairs every *-foreground colour slot with its background", () => {
    for (const [fg, bg] of CONTRAST_PAIRS) {
      expect(COLOR_SLOTS, `--${fg} is not a contract colour`).toContain(fg);
      expect(COLOR_SLOTS, `--${bg} is not a contract colour`).toContain(bg);
    }
    const paired = CONTRAST_PAIRS.map(([fg]) => fg);
    const foregrounds = COLOR_SLOTS.filter((s) => s.endsWith("-foreground"));
    expect(paired.sort()).toEqual(["foreground", ...foregrounds].sort());
  });

  it("resolves the DTCG $type per slot", () => {
    expect(slotType("primary")).toBe("color");
    expect(slotType("radius")).toBe("dimension");
    expect(slotType("font-sans")).toBe("fontFamily");
    expect(slotType("motion-fast")).toBe("duration");
    expect(slotType("font-serif")).toBe("fontFamily");
    expect(slotType("shadow-md")).toBe("shadow");
    expect(slotType("container-lg")).toBe("dimension");
  });

  it("carries the display face, elevation and container slots as extended", () => {
    for (const slot of [
      "font-serif",
      "shadow-sm",
      "shadow-md",
      "shadow-lg",
      "container-sm",
      "container-md",
      "container-lg",
    ]) {
      expect(EXTENDED_SLOTS, `--${slot} is not an extended slot`).toContain(slot);
    }
  });
});

describe("@moderno-ui/tokens — tokens.css satisfies the contract", () => {
  it("defines every contract slot in :root with a non-empty value", () => {
    for (const slot of CONTRACT) {
      expect(root.get(slot.name), `--${slot.name} missing in :root`).toBeTruthy();
    }
  });

  it("expresses all colour slots in OKLCH", () => {
    for (const slot of COLOR_SLOTS) {
      expect(root.get(slot), `--${slot}`).toMatch(/^oklch\(/);
    }
  });

  it("declares no colour custom property outside the contract", () => {
    for (const name of root.keys()) {
      const declared = CONTRACT.some((s) => s.name === name);
      expect(declared, `--${name} in tokens.css is not in the contract`).toBe(true);
    }
  });
});

describe("@moderno-ui/tokens — dark variant", () => {
  it("redefines the core slots in .dark", () => {
    expect(tokenRules.has(".dark")).toBe(true);
    for (const slot of ["background", "foreground", "primary"]) {
      expect(dark.get(slot), `--${slot} not overridden in .dark`).toMatch(/^oklch\(/);
    }
  });

  it("gives the elevation scale its own dark values (a light shadow vanishes there)", () => {
    for (const slot of ["shadow-sm", "shadow-md", "shadow-lg"]) {
      expect(dark.get(slot), `--${slot} not overridden in .dark`).toBeTruthy();
      expect(dark.get(slot)).not.toBe(root.get(slot));
    }
  });
});

describe("@moderno-ui/tokens — multi-brand", () => {
  it("ships a [data-brand] scope that remaps at least one contract slot", () => {
    const brandSelectors = [...tokenRules.keys()].filter((s) => s.includes("[data-brand"));
    expect(brandSelectors.length).toBeGreaterThan(0);
    const remapsContractSlot = brandSelectors.some((sel) => {
      const decls = tokenRules.get(sel)!;
      return COLOR_SLOTS.some((slot) => decls.has(slot));
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

describe("@moderno-ui/tokens — Tailwind v4 preset", () => {
  it("maps every colour slot to a utility variable via @theme inline", () => {
    expect(presetCss).toMatch(/@theme\s+inline/);
    for (const slot of COLOR_SLOTS) {
      const re = new RegExp(`--color-${slot}:\\s*var\\(--${slot}\\)`);
      expect(presetCss, `--color-${slot} not mapped`).toMatch(re);
    }
  });

  it("maps the font slots to Tailwind font variables", () => {
    expect(presetCss).toMatch(/--font-sans:\s*var\(--font-sans\)/);
    expect(presetCss).toMatch(/--font-mono:\s*var\(--font-mono\)/);
    expect(presetCss).toMatch(/--font-serif:\s*var\(--font-serif\)/);
  });

  it("maps the elevation scale to Tailwind shadow variables", () => {
    for (const step of ["sm", "md", "lg"]) {
      const re = new RegExp(`--shadow-${step}:\\s*var\\(--shadow-${step}\\)`);
      expect(presetCss, `--shadow-${step} not mapped`).toMatch(re);
    }
  });

  /**
   * The container breakpoints are the one mapping that cannot be `inline`: a
   * container query condition may not contain var(), so Tailwind needs the
   * literal length to emit `@container (width >= 24rem)`. That literal is a
   * copy of the tokens.css default, so guard the two against drifting apart.
   */
  it("registers the container breakpoints as literals matching tokens.css", () => {
    const inlineTheme = themeBlockDecls(presetCss, "inline");
    const plainTheme = themeBlockDecls(presetCss, "");
    for (const step of ["sm", "md", "lg"]) {
      const slot = `container-${step}`;
      expect(inlineTheme.has(slot), `--${slot} must not be mapped inline`).toBe(false);
      expect(plainTheme.get(slot), `--${slot} missing from the plain @theme block`).toBe(
        root.get(slot),
      );
    }
  });
});
