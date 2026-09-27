import { describe, expect, it } from "vitest";
import type { AtRule } from "postcss";
import { normalizeSelector, parsePartial, prop, ruleDecls } from "./stylesheet.ts";

const root = parsePartial("tooltip");

/*
 * Tooltip's surface is the popover's: its own 1px --border is the edge and
 * a --shadow-* slot, used as it is, is the soft drop under it. A ring stacked
 * into box-shadow on top of the border doubled the edge into 2px (47d89e2), so
 * the shadow is the slot and nothing else. Ark renders no root element, so
 * the recipe's size rides on the content.
 */
describe("@moderno-ui/core components.css — Tooltip", () => {
  const CONTENT = `[data-scope="tooltip"][data-part="content"]`;
  const ARROW = `[data-scope="tooltip"][data-part="arrow"]`;
  const ARROW_TIP = `[data-scope="tooltip"][data-part="arrow-tip"]`;

  it("paints the content as a popover surface edged by its own border", () => {
    const decls = ruleDecls(root, CONTENT);
    expect(prop(decls, "background-color")).toBe("var(--popover)");
    expect(prop(decls, "color")).toBe("var(--popover-foreground)");
    expect(prop(decls, "border")).toBe("1px solid var(--border)");
    expect(prop(decls, "border-radius")).toBe("var(--radius)");
  });

  it("lifts it with an elevation slot as it is, never a ring stacked in box-shadow", () => {
    const shadows: string[] = [];
    root.walkDecls("box-shadow", (decl) => {
      shadows.push(decl.value);
    });
    expect(shadows).toEqual(["var(--shadow-md)"]);
  });

  it("takes its type from the UI scale and the weight slots", () => {
    const decls = ruleDecls(root, CONTENT);
    expect(prop(decls, "font-family")).toBe("var(--font-sans)");
    expect(prop(decls, "font-size")).toBe("var(--text-ui-sm)");
    expect(prop(decls, "line-height")).toBe("var(--leading-ui-sm)");
    expect(prop(decls, "font-weight")).toBe("var(--font-weight-normal)");
  });

  it("fills the arrow with the surface and edges its outer sides with the border", () => {
    expect(prop(ruleDecls(root, ARROW), "--arrow-background")).toBe("var(--popover)");
    const tip = ruleDecls(root, ARROW_TIP);
    expect(prop(tip, "border-top")).toBe("1px solid var(--border)");
    expect(prop(tip, "border-left")).toBe("1px solid var(--border)");
  });

  it.each([
    ["sm", "var(--text-ui-xs)", "var(--leading-ui-xs)"],
    ["lg", "var(--text-ui-md)", "var(--leading-ui-md)"],
  ])("sizes the %s content's type and padding from slots", (size, fontSize, lineHeight) => {
    const decls = ruleDecls(root, `${CONTENT}[data-size="${size}"]`);
    expect(prop(decls, "font-size")).toBe(fontSize);
    expect(prop(decls, "line-height")).toBe(lineHeight);
    expect(prop(decls, "padding")).toMatch(/^var\(--spacing-\d\) var\(--spacing-\d\)$/);
  });

  it("sizes every padding, width and arrow from spacing slots", () => {
    root.walkDecls(/^(padding|max-width|--arrow-size)$/, (decl) => {
      for (const part of decl.value.split(/\s(?![^(]*\))/)) {
        expect(part, `${decl.parent?.toString().split("{")[0]} ${decl.prop}`).toMatch(
          /^(calc\()?var\(--spacing-\d\)/,
        );
      }
    });
  });

  it("fades in and out over a motion slot, and not when opened at once", () => {
    expect(prop(ruleDecls(root, `${CONTENT}[data-state="open"]`), "animation")).toMatch(
      /^moderno-tooltip-in var\(--motion-\w+\)/,
    );
    expect(prop(ruleDecls(root, `${CONTENT}[data-state="closed"]`), "animation")).toMatch(
      /^moderno-tooltip-out var\(--motion-\w+\)/,
    );
    expect(prop(ruleDecls(root, `${CONTENT}[data-instant]`), "animation")).toBe("none");
  });

  it("holds still under reduced motion, outweighing the open and closed rules", () => {
    const queries: AtRule[] = [];
    root.walkAtRules("media", (at) => {
      queries.push(at);
    });
    expect(queries.map((at) => at.params)).toEqual(["(prefers-reduced-motion: reduce)"]);
    const selectors: string[] = [];
    queries[0]!.walkRules((rule) => {
      selectors.push(normalizeSelector(rule.selector));
    });
    expect(selectors).toEqual([`${CONTENT}[data-state]`]);
    expect(prop(ruleDecls(root, `${CONTENT}[data-state]`), "animation")).toBe("none");
  });
});
