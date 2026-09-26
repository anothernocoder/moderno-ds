import { describe, expect, it } from "vitest";
import postcss, { type AtRule, type Declaration, type Rule } from "postcss";
import { partialNames, prop, readComponentsCss, readPartial, ruleDecls } from "./stylesheet.ts";

/*
 * Guards over the whole published stylesheet. A scope's own contract lives in
 * `components-css.<scope>.test.ts`, next to its partial.
 */
const css = readComponentsCss();
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

/*
 * `pnpm gen` (the components-css aggregator) wraps every scope partial in
 * `@layer moderno.components` and closes the layer with `_hidden.css`. A
 * partial that opened a layer of its own would leave the components layer,
 * and a part rule after the `[hidden]` one could re-show a hidden part.
 */
describe("@moderno-ui/core components.css — one partial per scope, assembled", () => {
  it.each(partialNames().filter((name) => name !== "_base"))(
    "%s.css holds bare rules: no @layer of its own",
    (name) => {
      expect(readPartial(name)).not.toMatch(/@layer\b/);
    },
  );

  it("closes the components layer with the [hidden] rule", () => {
    const layer = root.last as AtRule;
    expect(`@${layer.name} ${layer.params}`).toBe("@layer moderno.components");
    expect((layer.last as Rule).selector).toBe("[data-scope][data-part][hidden]");
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
 * A bordered control draws its focus ring INSIDE its box: a 2px ring offset
 * by -2px covers the 1px resting border. An outset ring would leave that
 * border visible inside it, a double border (7ea4320).
 */
describe("@moderno-ui/core components.css — bordered controls ring inset", () => {
  it.each([
    `[data-scope="field"][data-part="input"]:focus-visible`,
    `[data-scope="field"][data-part="textarea"]:focus-visible`,
    `[data-scope="select"][data-part="trigger"]:focus-visible`,
    `[data-scope="pin-input"][data-part="input"]:focus-visible`,
    `[data-scope="number-input"][data-part="control"]:focus-within`,
  ])("%s", (selector) => {
    const decls = ruleDecls(root, selector);
    expect(prop(decls, "outline")).toBe("2px solid var(--ring)");
    expect(prop(decls, "outline-offset")).toBe("-2px");
  });
});
