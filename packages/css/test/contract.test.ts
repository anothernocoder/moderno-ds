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
  FONT_WEIGHTS,
  GROUP_ROLES,
  OTHER_SLOTS,
  TYPE_STEP_ROLES,
  TYPE_STEPS,
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

describe("@moderno-ui/css — contract data", () => {
  it("splits every slot into exactly one derived list", () => {
    const derived = [...COLOR_SLOTS, ...OTHER_SLOTS, ...EXTENDED_SLOTS];
    expect(new Set(derived).size).toBe(derived.length);
    expect(derived.sort()).toEqual(CONTRACT.map((s) => s.name).sort());
  });

  it("gives every slot a one-line role", () => {
    for (const slot of CONTRACT) {
      expect(slot.role.trim(), `--${slot.name} has no role`).not.toBe("");
      expect(slot.role, `--${slot.name}'s role spans lines`).not.toMatch(/\n/);
    }
  });

  it("describes every group and every type step in one line", () => {
    for (const role of [...Object.values(GROUP_ROLES), ...Object.values(TYPE_STEP_ROLES)]) {
      expect(role.trim()).not.toBe("");
      expect(role).not.toMatch(/\n/);
    }
    expect(Object.keys(GROUP_ROLES).sort()).toEqual(
      [...new Set(CONTRACT.map((s) => s.group))].sort(),
    );
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
    expect(slotType("overlay")).toBe("color");
    expect(slotType("text-ui-md")).toBe("dimension");
    expect(slotType("leading-body")).toBe("dimension");
    expect(slotType("font-weight-semibold")).toBe("fontWeight");
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

  /*
   * `--overlay` is a colour, but a theme is not required to define it: it is
   * extended, so it stays out of the mandatory colour list (theme-compile's
   * required slots) and out of the editor's colour groups.
   */
  it("carries the modal scrim as an extended colour, not a required one", () => {
    expect(EXTENDED_SLOTS).toContain("overlay");
    expect(COLOR_SLOTS).not.toContain("overlay");
    expect(COLOR_GROUPS.flatMap((g) => g.slots)).not.toContain("overlay");
  });

  it("carries a size and a line height per type step, as extended slots", () => {
    for (const step of TYPE_STEPS) {
      expect(EXTENDED_SLOTS, `--text-${step}`).toContain(`text-${step}`);
      expect(EXTENDED_SLOTS, `--leading-${step}`).toContain(`leading-${step}`);
    }
  });

  it("carries the font weights as extended slots, under Tailwind's own key names", () => {
    expect([...FONT_WEIGHTS]).toEqual(["normal", "medium", "semibold", "bold"]);
    for (const weight of FONT_WEIGHTS) {
      expect(EXTENDED_SLOTS, `--font-weight-${weight}`).toContain(`font-weight-${weight}`);
    }
  });
});

describe("@moderno-ui/css — tokens.css satisfies the contract", () => {
  // theme-compile's neutral mode owns the rest: every slot present in :root,
  // colours in OKLCH, extended slots non-empty (and neutral.test.ts ties this
  // file to that compile). It accepts an empty `$value` for these three.
  it("gives --radius and the font stacks a non-empty value in :root", () => {
    for (const slot of OTHER_SLOTS) {
      expect(root.get(slot)?.trim(), `--${slot} is empty in :root`).toBeTruthy();
    }
  });
});

describe("@moderno-ui/css — dark variant", () => {
  it("redefines the core slots in .dark", () => {
    expect(tokenRules.has(".dark")).toBe(true);
    for (const slot of ["background", "foreground", "primary"]) {
      expect(dark.get(slot), `--${slot} not overridden in .dark`).toMatch(/^oklch\(/);
    }
  });

  it("gives the modal scrim a denser dark value, and keeps it a black wash in both", () => {
    expect(dark.get("overlay"), "--overlay not overridden in .dark").toBeTruthy();
    expect(dark.get("overlay")).not.toBe(root.get("overlay"));
    // A mix of --foreground would turn milky grey on a dark page.
    for (const value of [root.get("overlay"), dark.get("overlay")]) {
      expect(value).toMatch(/^oklch\(0 0 0 \/ [\d.]+\)$/);
    }
  });

  it("gives the elevation scale its own dark values (a light shadow vanishes there)", () => {
    for (const slot of ["shadow-sm", "shadow-md", "shadow-lg"]) {
      expect(dark.get(slot), `--${slot} not overridden in .dark`).toBeTruthy();
      expect(dark.get(slot)).not.toBe(root.get(slot));
    }
  });
});

describe("@moderno-ui/css — multi-brand", () => {
  // A brand is a registry theme (theme-contrast); the [data-brand] switch is
  // covered by theme-compile's branded-theme tests, not by a demo scope here.
  it("ships only :root and .dark, with no [data-brand] scope", () => {
    expect([...tokenRules.keys()].sort()).toEqual([".dark", ":root"]);
  });
});

describe("@moderno-ui/css — Tailwind v4 preset", () => {
  it("maps every colour slot to a utility variable via @theme inline", () => {
    expect(presetCss).toMatch(/@theme\s+inline/);
    for (const slot of COLOR_SLOTS) {
      const re = new RegExp(`--color-${slot}:\\s*var\\(--${slot}\\)`);
      expect(presetCss, `--color-${slot} not mapped`).toMatch(re);
    }
  });

  it("maps the extended colour slots too (bg-overlay)", () => {
    for (const slot of CONTRACT.filter((s) => s.type === "color").map((s) => s.name)) {
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

  it("maps every type step to a Tailwind text size with its line height", () => {
    for (const step of TYPE_STEPS) {
      const inlineTheme = themeBlockDecls(presetCss, "inline");
      expect(inlineTheme.get(`text-${step}`), `--text-${step}`).toBe(`var(--text-${step})`);
      expect(inlineTheme.get(`text-${step}--line-height`)).toBe(`var(--leading-${step})`);
      expect(inlineTheme.get(`leading-${step}`), `--leading-${step}`).toBe(
        `var(--leading-${step})`,
      );
    }
  });

  it("maps every font weight onto Tailwind's weight key of the same name", () => {
    const inlineTheme = themeBlockDecls(presetCss, "inline");
    for (const weight of FONT_WEIGHTS) {
      const slot = `font-weight-${weight}`;
      expect(inlineTheme.get(slot), `--${slot}`).toBe(`var(--${slot})`);
    }
  });

  /**
   * The unlayered :root in tokens.css beats Tailwind's `@layer theme` defaults,
   * so a step named like a stock key (`sm`, `lg`, `base`…) would silently
   * resize every `text-sm` in a consumer app.
   */
  it("keeps the type steps clear of Tailwind's own text keys", () => {
    const stock = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl"];
    for (const step of TYPE_STEPS) expect(stock).not.toContain(step);
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

  /**
   * `--container-*` is Tailwind's own namespace and the contract's three steps
   * are not its values, so the preset resets it before declaring them: keeping
   * Tailwind's `xl`/`2xl`/`3xl` alongside would leave `max-w-lg` (48rem) wider
   * than `max-w-xl` (36rem). The contract owns the namespace whole.
   */
  it("resets the Tailwind container namespace, leaving only the contract's steps", () => {
    const plainTheme = themeBlockDecls(presetCss, "");
    expect(plainTheme.get("container-*")).toBe("initial");
    const containerKeys = [...plainTheme.keys()].filter((k) => k.startsWith("container-"));
    expect(containerKeys.sort()).toEqual(
      ["container-*", "container-lg", "container-md", "container-sm"].sort(),
    );
  });
});
