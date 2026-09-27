import { describe, expect, it } from "vitest";
import type { AtRule, Declaration, Rule } from "postcss";
import { parsePartial, prop, ruleDecls } from "./stylesheet.ts";

const root = parsePartial("popover");

/*
 * Popover floats over the page, so its contract is the elevation one: the
 * popover fill, a 1px --border edge and a soft --shadow-* drop — never a ring
 * stacked into box-shadow, which doubled the border into a 2px edge (47d89e2).
 * Floating-ui lays the positioner out inline, so the partial leaves it alone.
 */
describe("@moderno-ui/core components.css — Popover", () => {
  const CONTENT = `[data-scope="popover"][data-part="content"]`;

  /** Every declaration in the partial, with the selector it sits under. */
  const decls: { selector: string; decl: Declaration }[] = [];
  root.walkRules((rule: Rule) => {
    rule.walkDecls((decl) => {
      decls.push({ selector: rule.selector, decl });
    });
  });

  it("draws the surface from the popover slots with a 1px --border edge", () => {
    const content = ruleDecls(root, CONTENT);
    expect(prop(content, "background-color")).toBe("var(--popover)");
    expect(prop(content, "color")).toBe("var(--popover-foreground)");
    expect(prop(content, "border")).toBe("1px solid var(--border)");
    expect(prop(content, "border-radius")).toBe("var(--radius)");
  });

  it("lifts it with one --shadow-* slot as it is, never a ring in box-shadow", () => {
    const shadows = decls.filter(({ decl }) => decl.prop === "box-shadow");
    expect(shadows.map(({ decl }) => decl.value)).toEqual(["var(--shadow-md)"]);
  });

  it("leaves the positioner to floating-ui", () => {
    const positioner = decls.filter(({ selector }) =>
      selector.includes(`[data-part="positioner"]`),
    );
    expect(positioner).toEqual([]);
  });

  it("fills the arrow like the surface and edges its tip in --border", () => {
    const content = ruleDecls(root, CONTENT);
    expect(prop(content, "--arrow-background")).toBe("var(--popover)");
    expect(prop(content, "--arrow-size")).toMatch(/^var\(--spacing-\d\)$/);
    const tip = ruleDecls(root, `[data-scope="popover"][data-part="arrow-tip"]`);
    expect(prop(tip, "border-top")).toBe("1px solid var(--border)");
    expect(prop(tip, "border-left")).toBe("1px solid var(--border)");
  });

  it("steps padding, gap and type per size, from the contract slots", () => {
    const base = ruleDecls(root, CONTENT);
    const sizes = {
      sm: ruleDecls(root, `${CONTENT}[data-size="sm"]`),
      lg: ruleDecls(root, `${CONTENT}[data-size="lg"]`),
    };
    expect(prop(base, "padding")).toBe("var(--spacing-4)");
    expect(prop(sizes.sm, "padding")).toBe("var(--spacing-3)");
    expect(prop(sizes.lg, "padding")).toBe("var(--spacing-6)");
    expect(prop(base, "font-size")).toBe("var(--text-ui-md)");
    expect(prop(sizes.sm, "font-size")).toBe("var(--text-ui-sm)");
    expect(prop(sizes.lg, "font-size")).toBe("var(--text-ui-lg)");
    expect(prop(base, "line-height")).toBe("var(--leading-ui-md)");
    expect(prop(sizes.sm, "line-height")).toBe("var(--leading-ui-sm)");
    expect(prop(sizes.lg, "line-height")).toBe("var(--leading-ui-lg)");
  });

  it("caps the width at a container slot and the room the positioner reports", () => {
    expect(prop(ruleDecls(root, CONTENT), "max-width")).toBe(
      "min(var(--container-sm), var(--available-width))",
    );
    expect(prop(ruleDecls(root, `${CONTENT}[data-size="lg"]`), "max-width")).toBe(
      "min(var(--container-md), var(--available-width))",
    );
  });

  it("takes every length, type size and weight from a slot (or zero)", () => {
    const LENGTH = /^(padding.*|gap|width|height|inset-.*|font-size|line-height|font-weight)$/;
    let checked = 0;
    for (const { selector, decl } of decls) {
      if (!LENGTH.test(decl.prop)) continue;
      checked++;
      // `inherit` only on the title and description, which take the content's type.
      expect(decl.value, `${selector} { ${decl.prop} }`).toMatch(
        /^(0|inherit|var\(--(spacing-\d|text-ui-(sm|md|lg)|leading-ui-(sm|md|lg)|font-weight-[a-z]+)\))$/,
      );
    }
    expect(checked).toBeGreaterThan(10);
  });

  it("resets the title's and description's own heading and paragraph look", () => {
    // Some bindings render an <h2> and a <p>: the browser's 1.5em heading and
    // its margins would apply in a portal, outside any preflight.
    for (const part of ["title", "description"]) {
      const decls = ruleDecls(root, `[data-scope="popover"][data-part="${part}"]`);
      expect(prop(decls, "margin"), part).toBe("0");
      expect(prop(decls, "font-size"), part).toBe("inherit");
    }
  });

  it("rings the focused close trigger inside its own box", () => {
    const decls = ruleDecls(
      root,
      `[data-scope="popover"][data-part="close-trigger"]:focus-visible`,
    );
    expect(prop(decls, "outline")).toBe("2px solid var(--ring)");
    expect(prop(decls, "outline-offset")).toBe("-2px");
  });

  it("names no viewport in a media query: only the reduced-motion preference", () => {
    const queries: string[] = [];
    root.walkAtRules("media", (rule: AtRule) => {
      queries.push(rule.params);
    });
    expect(queries).toEqual(["(prefers-reduced-motion: reduce)"]);
  });
});
