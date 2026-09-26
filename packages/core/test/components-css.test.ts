import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import postcss, { type Declaration, type Rule } from "postcss";

const css = readFileSync(
  fileURLToPath(new URL("../src/styles/components.css", import.meta.url)),
  "utf8",
);
const root = postcss.parse(css);

const decls: Declaration[] = [];
root.walkDecls((d: Declaration) => {
  decls.push(d);
});
const selectors: string[] = [];
root.walkRules((r: Rule) => {
  selectors.push(r.selector);
});

/** Props whose value paints a brand colour — must come from a token, never a literal. */
const COLOR_PROPS = new Set([
  "color",
  "background",
  "background-color",
  "border-color",
  "outline-color",
  "fill",
  "stroke",
]);

describe("@moderno-ui/core components.css — Ark scope/part convention (F1.2)", () => {
  it("targets [data-scope]/[data-part], never component-owned class names", () => {
    expect(selectors.length).toBeGreaterThan(0);
    expect(selectors.some((s) => s.includes("[data-scope") || s.includes("[data-part"))).toBe(true);
    // No bare class-name selectors like `.button` / `.btn`.
    expect(selectors.some((s) => /(^|\s|,)\.[a-z]/i.test(s))).toBe(false);
  });

  it("declares the cascade layers (skeleton: base + components)", () => {
    expect(css).toMatch(/@layer\s+moderno\.base\s*,\s*moderno\.components/);
  });
});

describe("@moderno-ui/core components.css — zero baked brand values (F1.2)", () => {
  it("contains no literal colour values (hex / rgb / hsl / oklch)", () => {
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(css).not.toMatch(/\b(rgb|rgba|hsl|hsla|oklch|oklab)\(/i);
  });

  /*
   * Non-brand keyword values: not literal colours, so not a contract breach.
   * `currentColor` is the chart pattern — a series <g> sets `color` from a
   * --chart-* slot and its shapes paint with currentColor, so the colour still
   * traces back to a token. `none`/`transparent`/`inherit` carry no brand value.
   */
  const COLOR_KEYWORDS = new Set(["none", "currentcolor", "transparent", "inherit"]);

  it("paints every colour-bearing property from a contract variable or a non-brand keyword", () => {
    for (const d of decls) {
      if (!COLOR_PROPS.has(d.prop)) continue;
      if (COLOR_KEYWORDS.has(d.value.trim().toLowerCase())) continue;
      expect(d.value, `${d.prop}: ${d.value} is not a var(--…) reference`).toMatch(/var\(--/);
    }
  });

  it("derives any border-radius from the --radius contract slot", () => {
    for (const d of decls) {
      if (d.prop !== "border-radius") continue;
      expect(d.value, `border-radius: ${d.value}`).toMatch(/var\(--radius/);
    }
  });

  it("sets font-family from --font-sans / --font-mono, not a literal stack", () => {
    for (const d of decls) {
      if (d.prop !== "font-family") continue;
      expect(d.value, `font-family: ${d.value}`).toMatch(/var\(--font-(sans|mono)\)/);
    }
  });
});

/*
 * Divider's label gap is the one place in the sheet where a flow-relative
 * margin is read under a *rotated* writing mode. `margin-block`/`margin-inline`
 * resolve against the element's own writing mode, and the vertical divider's
 * label is `vertical-rl`, so its inline axis is the page's vertical one:
 * `margin-inline` is the along-the-rule axis in both orientations. Getting this
 * backwards costs nothing at build time and everything at render time — the
 * stroke butts into the caption's glyphs and the rule widens by two spacing
 * steps — so the axis is pinned here rather than left to a screenshot.
 */
describe("@moderno-ui/core components.css — Divider label gap opens along the rule", () => {
  /** Declarations of the `[data-orientation="…"] [data-part="label"]` rule. */
  const labelRule = (orientation: "horizontal" | "vertical"): Declaration[] => {
    const found: Declaration[] = [];
    root.walkRules((r: Rule) => {
      if (!r.selector.includes(`[data-scope="divider"][data-orientation="${orientation}"]`)) return;
      if (!r.selector.includes(`[data-part="label"]`)) return;
      r.walkDecls((d: Declaration) => {
        found.push(d);
      });
    });
    return found;
  };
  const prop = (decls: Declaration[], name: string) => decls.find((d) => d.prop === name)?.value;

  it("rotates the vertical label so its inline axis runs along the rule", () => {
    expect(prop(labelRule("vertical"), "writing-mode")).toBe("vertical-rl");
    expect(prop(labelRule("horizontal"), "writing-mode")).toBeUndefined();
  });

  it("opens the gap with margin-inline in both orientations", () => {
    for (const orientation of ["horizontal", "vertical"] as const) {
      const decls = labelRule(orientation);
      expect(prop(decls, "margin-inline"), `${orientation} label`).toMatch(/var\(--spacing-/);
      // `margin-block` here is the across-the-rule axis: it would pad the
      // label's sides and leave the two halves of the stroke touching it.
      for (const across of ["margin-block", "margin-block-start", "margin-block-end"]) {
        expect(prop(decls, across), `${orientation} label sets ${across}`).toBeUndefined();
      }
    }
  });
});

/*
 * Button is a plain native <button> in every binding — no Ark machine — so two
 * browser defaults leak through unless the sheet overrides them: the UA grey
 * `buttonface` fill (visible on `ghost`, the one variant with no fill of its
 * own), and a native `disabled` that no one turns into `data-disabled`, so the
 * shared base affordance (`[data-disabled]` → dimmed, inert) never reaches it.
 */
describe("@moderno-ui/core components.css — Button overrides the native defaults", () => {
  /** Declarations of the rules whose selector is exactly `selector`. */
  const ruleDecls = (selector: string): Declaration[] => {
    const found: Declaration[] = [];
    root.walkRules((r: Rule) => {
      if (!r.selectors.map((s) => s.trim()).includes(selector)) return;
      r.walkDecls((d: Declaration) => {
        found.push(d);
      });
    });
    return found;
  };
  const prop = (decls: Declaration[], name: string) => decls.find((d) => d.prop === name)?.value;
  const BUTTON = `[data-scope="button"][data-part="root"]`;

  it("clears the UA button fill on the root, so ghost is transparent anywhere", () => {
    expect(prop(ruleDecls(BUTTON), "background-color")).toBe("transparent");
  });

  it("dims and disables a native :disabled button like [data-disabled]", () => {
    const decls = ruleDecls(`${BUTTON}:disabled`);
    expect(prop(decls, "opacity")).toBe("0.5");
    expect(prop(decls, "pointer-events")).toBe("none");
  });
});

/*
 * Toggle's root and ToggleGroup's items are native <button>s too, so the same
 * two browser defaults leak through: the UA `buttonface` fill (a toggle at
 * rest has no fill of its own) and a native `disabled` set without Ark — or
 * before it hydrates — which carries no `data-disabled` for the base layer.
 */
describe("@moderno-ui/core components.css — Toggle and ToggleGroup buttons override the native defaults", () => {
  const ruleDecls = (selector: string): Declaration[] => {
    const found: Declaration[] = [];
    root.walkRules((r: Rule) => {
      if (!r.selectors.map((s) => s.trim()).includes(selector)) return;
      r.walkDecls((d: Declaration) => {
        found.push(d);
      });
    });
    return found;
  };
  const prop = (decls: Declaration[], name: string) => decls.find((d) => d.prop === name)?.value;

  for (const button of [
    `[data-scope="toggle"][data-part="root"]`,
    `[data-scope="toggle-group"][data-part="item"]`,
  ]) {
    it(`clears the UA button fill on ${button}`, () => {
      expect(prop(ruleDecls(button), "background-color")).toBe("transparent");
    });

    it(`dims and disables a native :disabled ${button} like [data-disabled]`, () => {
      const decls = ruleDecls(`${button}:disabled`);
      expect(prop(decls, "opacity")).toBe("0.5");
      expect(prop(decls, "pointer-events")).toBe("none");
    });
  }

  const selectorsInOrder: string[] = [];
  root.walkRules((r: Rule) => {
    selectorsInOrder.push(...r.selectors.map((s) => s.trim()));
  });

  for (const { name, rootSelector, disabledSelector } of [
    {
      name: "Toggle",
      rootSelector: `[data-scope="toggle"][data-part="root"]`,
      disabledSelector: `[data-scope="toggle"][data-part="root"]:disabled`,
    },
    {
      name: "ToggleGroup",
      rootSelector: `[data-scope="toggle-group"][data-part="root"]`,
      disabledSelector: `[data-scope="toggle-group"][data-part="item"]:disabled`,
    },
  ]) {
    it(`dims a disabled ${name} once: its parts are reset after the :disabled rule`, () => {
      const reset = `${rootSelector}[data-disabled] :where([data-part])`;
      expect(prop(ruleDecls(reset), "opacity")).toBe("1");
      expect(selectorsInOrder.indexOf(reset)).toBeGreaterThan(
        selectorsInOrder.indexOf(disabledSelector),
      );
    });
  }
});
