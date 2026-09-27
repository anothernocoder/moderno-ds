import { describe, expect, it } from "vitest";
import type { Rule } from "postcss";
import { parsePartial, prop, ruleDecls } from "./stylesheet.ts";

const root = parsePartial("splitter");

/*
 * Splitter takes its whole layout from Ark, inline: the root's flex
 * direction and size, each panel's flex-grow (its size) and limits, and each
 * trigger's `flex: 0 0 auto`. The stylesheet must only paint around that —
 * never set a flex or size property on the root or a panel, which would lose
 * to the inline style or, worse, fight it — and draw each trigger, a native
 * <button>, as a rule with a grip.
 */
describe("@moderno-ui/core components.css — Splitter", () => {
  const TRIGGER = `[data-scope="splitter"][data-part="resize-trigger"]`;
  const INDICATOR = `[data-scope="splitter"][data-part="resize-trigger-indicator"]`;
  const LAYOUT_PROPS = /^(display|flex(-.*)?|width|height|min-width|min-height|overflow)$/;

  it("leaves the root's and the panels' layout to Ark", () => {
    const rootOrPanel = /\[data-part="(root|panel)"\](\[[^\]]+\])*$/;
    let checked = 0;
    root.walkRules((rule: Rule) => {
      if (!rule.selectors.some((s) => rootOrPanel.test(s.trim()))) return;
      checked++;
      rule.walkDecls((decl) => {
        expect(decl.prop, `${rule.selector} { ${decl.prop} }`).not.toMatch(LAYOUT_PROPS);
      });
    });
    expect(checked).toBeGreaterThanOrEqual(2);
  });

  it("never pads a panel, which would skew the sizes Ark reports", () => {
    // A panel's size is its flex-grow share of the space left after every
    // padding: padded 30 / 70 panels render wider than 30%.
    root.walkRules((rule: Rule) => {
      if (!rule.selectors.some((s) => /\[data-part="panel"\]/.test(s))) return;
      rule.walkDecls((decl) => {
        expect(decl.prop, rule.selector).not.toMatch(/^padding/);
      });
    });
  });

  it("clears the UA button look on the trigger", () => {
    const decls = ruleDecls(root, TRIGGER);
    expect(prop(decls, "background-color")).toBe("transparent");
    expect(prop(decls, "border")).toBe("0");
    expect(prop(decls, "padding")).toBe("0");
  });

  it("draws the rule as a hairline border in --border, turning --primary when active", () => {
    expect(prop(ruleDecls(root, `${TRIGGER}::before`), "border")).toBe("0 solid var(--border)");
    for (const state of [":hover", "[data-focus]", "[data-dragging]"]) {
      expect(prop(ruleDecls(root, `${TRIGGER}${state}::before`), "border-color"), state).toBe(
        "var(--primary)",
      );
    }
  });

  it("rings the focused trigger inside its own box", () => {
    const decls = ruleDecls(root, `${TRIGGER}:focus-visible`);
    expect(prop(decls, "outline-color")).toBe("var(--ring)");
    expect(prop(decls, "outline-offset")).toBe("-2px");
  });

  it("sizes the grip from spacing slots in both orientations", () => {
    for (const orientation of ["horizontal", "vertical"]) {
      const decls = ruleDecls(root, `${INDICATOR}[data-orientation="${orientation}"]`);
      expect(prop(decls, "width"), orientation).toMatch(/^var\(--spacing-\d\)$/);
      expect(prop(decls, "height"), orientation).toMatch(/^var\(--spacing-\d\)$/);
    }
  });

  it("dims a disabled trigger once: its grip is reset", () => {
    expect(
      prop(
        ruleDecls(root, `${TRIGGER}[data-disabled] > [data-part="resize-trigger-indicator"]`),
        "opacity",
      ),
    ).toBe("1");
  });

  it("frames the enclosed variant with the border and radius slots", () => {
    const decls = ruleDecls(
      root,
      `[data-scope="splitter"][data-part="root"][data-variant="enclosed"]`,
    );
    expect(prop(decls, "border")).toBe("1px solid var(--border)");
    expect(prop(decls, "border-radius")).toBe("var(--radius)");
  });
});
