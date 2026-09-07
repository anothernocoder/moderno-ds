import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import postcss, { type Declaration, type Rule } from "postcss";

/**
 * Card's own contract, on top of the stylesheet-wide guards in
 * `components-css.test.ts`.
 *
 * DESIGN.md ("Elevation & Depth", "Shapes") specifies the card as a surface
 * step plus a 1px border — no shadow — with a sharp corner. The sharpness is
 * the *theme's* to decide (`theme-moderno` pins `--radius` to 0), so what has
 * to hold here is that the rules never bake a radius or reach for a shadow to
 * fake depth, and that every padding step comes off the spacing scale.
 */
const css = readFileSync(
  fileURLToPath(new URL("../src/styles/components.css", import.meta.url)),
  "utf8",
);
const root = postcss.parse(css);

/** Every declaration inside a rule whose selector targets `[data-scope="card"]`. */
const cardDecls: Declaration[] = [];
root.walkRules((rule: Rule) => {
  if (!rule.selector.includes('[data-scope="card"]')) return;
  rule.walkDecls((d: Declaration) => {
    cardDecls.push(d);
  });
});

function valuesOf(prop: string): string[] {
  return cardDecls.filter((d) => d.prop === prop).map((d) => d.value);
}

describe("components.css — Card", () => {
  it("has rules at all (guards the rest of this suite from vacuous passes)", () => {
    expect(cardDecls.length).toBeGreaterThan(10);
  });

  it("never paints a shadow — depth is a surface step plus a border", () => {
    const shadows = cardDecls.filter((d) => d.prop === "box-shadow" || d.prop === "filter");
    expect(shadows.map((d) => `${d.prop}: ${d.value}`)).toEqual([]);
  });

  it("draws a 1px edge from the --border slot", () => {
    expect(valuesOf("border")).toEqual(["1px solid var(--border)"]);
  });

  it("takes its corner from --radius rather than a literal", () => {
    expect(valuesOf("border-radius")).toEqual(["var(--radius)"]);
  });

  it("fills from the card / muted surface slots, never a literal", () => {
    const fills = valuesOf("background-color");
    expect(fills.length).toBeGreaterThan(0);
    for (const value of fills) {
      expect(value).toMatch(/^(var\(--(card|muted)\)|transparent)$/);
    }
  });

  it("steps every padding and gap off the spacing scale", () => {
    const steps = [...valuesOf("padding"), ...valuesOf("gap")];
    expect(steps.length).toBeGreaterThan(0);
    for (const value of steps) {
      expect(value, `padding/gap "${value}" is off-contract`).toMatch(/^var\(--spacing-[1-8]\)$/);
    }
  });

  it("pads the same three regions at every density", () => {
    // Every part is optional and the order is the consumer's, so a density
    // step that reached further than the base rule would let identical markup
    // gain padding purely by changing `size` — and would pad a nested root.
    const paddedBy = new Map<string, Set<string>>();
    root.walkRules((rule: Rule) => {
      if (!rule.selector.includes('[data-scope="card"]')) return;
      rule.walkDecls("padding", (d: Declaration) => {
        const parts = paddedBy.get(d.value) ?? new Set<string>();
        for (const selector of rule.selectors) {
          const subject = selector.split(">").pop()!;
          parts.add(/\[data-part="([a-z-]+)"\]/.exec(subject)?.[1] ?? `any child (${selector})`);
        }
        paddedBy.set(d.value, parts);
      });
    });

    expect([...paddedBy.keys()].sort()).toEqual([
      "var(--spacing-4)",
      "var(--spacing-6)",
      "var(--spacing-8)",
    ]);
    for (const [step, parts] of paddedBy) {
      expect([...parts].sort(), `padding: ${step}`).toEqual(["content", "footer", "header"]);
    }
  });

  it("styles the whole anatomy the bindings emit", () => {
    const parts = new Set<string>();
    root.walkRules((rule: Rule) => {
      if (!rule.selector.includes('[data-scope="card"]')) return;
      for (const m of rule.selector.matchAll(/\[data-part="([a-z-]+)"\]/g)) parts.add(m[1]!);
    });
    expect([...parts].sort()).toEqual([
      "content",
      "description",
      "footer",
      "header",
      "root",
      "title",
    ]);
  });
});
