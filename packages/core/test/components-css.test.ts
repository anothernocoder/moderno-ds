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

describe("@moderno/core components.css — Ark scope/part convention (F1.2)", () => {
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

describe("@moderno/core components.css — zero baked brand values (F1.2)", () => {
  it("contains no literal colour values (hex / rgb / hsl / oklch)", () => {
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(css).not.toMatch(/\b(rgb|rgba|hsl|hsla|oklch|oklab)\(/i);
  });

  it("paints every colour-bearing property from a contract variable", () => {
    for (const d of decls) {
      if (!COLOR_PROPS.has(d.prop)) continue;
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
