import { describe, expect, it } from "vitest";
import type { AtRule, Declaration, Rule } from "postcss";
import { normalizeSelector, parsePartial, prop, ruleDecls } from "./stylesheet.ts";

const root = parsePartial("drawer");

const BACKDROP = `[data-scope="drawer"][data-part="backdrop"]`;
const POSITIONER = `[data-scope="drawer"][data-part="positioner"]`;
const CONTENT = `[data-scope="drawer"][data-part="content"]`;

/** Every declaration in the partial, with the selector it sits under. */
const decls: { selector: string; decl: Declaration }[] = [];
root.walkRules((rule: Rule) => {
  rule.walkDecls((decl) => {
    decls.push({ selector: normalizeSelector(rule.selector), decl });
  });
});

/** Where each placement pins the panel, and the one edge that faces the page. */
const PLACEMENTS = {
  left: { direction: undefined, justify: "flex-start", edge: "border-right" },
  right: { direction: undefined, justify: "flex-end", edge: "border-left" },
  top: { direction: "column", justify: "flex-start", edge: "border-bottom" },
  bottom: { direction: "column", justify: "flex-end", edge: "border-top" },
} as const;

/*
 * Drawer is Ark's Dialog re-scoped, so its contract is the overlay one: the
 * --overlay scrim, the popover fill, a 1px --border edge and a soft --shadow-*
 * drop — never a ring stacked into box-shadow (47d89e2) — plus where each
 * placement pins the panel and how it slides.
 */
describe("@moderno-ui/core components.css — Drawer", () => {
  it("paints the backdrop from --overlay, never a literal colour or opacity", () => {
    const backdrop = ruleDecls(root, BACKDROP);
    expect(prop(backdrop, "background-color")).toBe("var(--overlay)");
    const onBackdrop = decls.filter(({ selector }) => selector.startsWith(BACKDROP));
    expect(onBackdrop.some(({ decl }) => decl.prop === "opacity")).toBe(false);
  });

  it("draws the panel from the popover slots", () => {
    const content = ruleDecls(root, CONTENT);
    expect(prop(content, "background-color")).toBe("var(--popover)");
    expect(prop(content, "color")).toBe("var(--popover-foreground)");
    expect(prop(content, "font-size")).toBe("var(--text-ui-md)");
  });

  it("lifts it with one --shadow-* slot as it is, never a ring in box-shadow", () => {
    const shadows = decls.filter(({ decl }) => decl.prop === "box-shadow");
    expect(shadows.map(({ decl }) => decl.value)).toEqual(["var(--shadow-lg)"]);
  });

  it.each(Object.entries(PLACEMENTS))(
    "pins a %s drawer to its edge, with a 1px --border on the side facing the page",
    (placement, { direction, justify, edge }) => {
      const positioner = ruleDecls(root, `${POSITIONER}[data-placement="${placement}"]`);
      expect(prop(positioner, "flex-direction")).toBe(direction);
      expect(prop(positioner, "justify-content")).toBe(justify);
      const content = ruleDecls(root, `${CONTENT}[data-placement="${placement}"]`);
      expect(prop(content, edge)).toBe("1px solid var(--border)");
      expect(prop(content, "border-radius")).toMatch(/var\(--radius\)/);
      // Only the inner edge: no other side draws a border.
      const borders = content.filter(
        (d) => d.prop.startsWith("border") && d.prop !== "border-radius",
      );
      expect(borders.map((d) => d.prop)).toEqual([edge]);
    },
  );

  it("sizes side drawers to the small container and caps top and bottom ones", () => {
    for (const side of ["left", "right"]) {
      const content = ruleDecls(root, `${CONTENT}[data-placement="${side}"]`);
      expect(prop(content, "max-width")).toBe("var(--container-sm)");
    }
    for (const side of ["top", "bottom"]) {
      const content = ruleDecls(root, `${CONTENT}[data-placement="${side}"]`);
      expect(prop(content, "max-height")).toMatch(/var\(--spacing-\d\)/);
    }
  });

  it.each(Object.keys(PLACEMENTS))("slides a %s drawer in and out from its edge", (placement) => {
    const open = ruleDecls(root, `${CONTENT}[data-placement="${placement}"][data-state="open"]`);
    const closed = ruleDecls(
      root,
      `${CONTENT}[data-placement="${placement}"][data-state="closed"]`,
    );
    expect(prop(open, "animation")).toMatch(
      new RegExp(`^moderno-drawer-in-${placement} var\\(--motion-`),
    );
    expect(prop(closed, "animation")).toMatch(
      new RegExp(`^moderno-drawer-out-${placement} var\\(--motion-`),
    );
  });

  it("stops moving under prefers-reduced-motion", () => {
    const reduced: string[] = [];
    root.walkAtRules("media", (at: AtRule) => {
      if (at.params !== "(prefers-reduced-motion: reduce)") return;
      at.walkDecls("animation", (decl) => {
        reduced.push(`${normalizeSelector((decl.parent as Rule).selector)} ${decl.value}`);
      });
    });
    expect(reduced).toEqual([
      `${BACKDROP}[data-state], ${CONTENT}[data-placement][data-state] none`,
    ]);
  });

  it("sets type from --text-ui-* and weight from --font-weight-*, no literal sizes", () => {
    for (const { decl } of decls) {
      if (decl.prop === "font-size") expect(decl.value).toMatch(/^var\(--text-ui-/);
      if (decl.prop === "font-weight") expect(decl.value).toMatch(/^var\(--font-weight-/);
      if (["width", "height", "max-width", "max-height", "gap", "padding"].includes(decl.prop)) {
        expect(decl.value, `${decl.prop}: ${decl.value}`).toMatch(/^(0|100%|.*var\(--)/);
      }
    }
  });

  it("gives a bare close trigger an inset --ring focus ring", () => {
    const focus = ruleDecls(root, `[data-scope="drawer"][data-part="close-trigger"]:focus-visible`);
    expect(prop(focus, "outline")).toBe("2px solid var(--ring)");
    expect(prop(focus, "outline-offset")).toBe("-2px");
  });
});
