import { describe, expect, it } from "vitest";
import postcss, { type AtRule, type Declaration, type Root } from "postcss";
import { normalizeSelector, parsePartial, prop, ruleDecls } from "./stylesheet.ts";

const root = parsePartial("menu");
const SCOPE = `[data-scope="menu"]`;

/** The one `@media` rule whose params are `params`, as a stylesheet of its own. */
function mediaBlock(params: string): Root {
  const found: AtRule[] = [];
  root.walkAtRules("media", (rule) => {
    if (rule.params === params) found.push(rule);
  });
  expect(found, `@media ${params}`).toHaveLength(1);
  return postcss.parse(found[0]!.nodes!.map((node) => node.toString()).join("\n"));
}

/** Declarations of `selector` outside any at-rule: the menu at its resting width. */
function topLevelDecls(selector: string): Declaration[] {
  return ruleDecls(root, selector).filter((decl) => decl.parent?.parent?.type === "root");
}

/*
 * The trigger and the context trigger are native <button>s, so the browser's
 * defaults leak through unless the sheet overrides them: the UA `buttonface`
 * fill (the trigger paints --background, the context trigger has none of its
 * own), and a native `disabled` that must look the same as `data-disabled`
 * (3be5002).
 */
describe("@moderno-ui/core components.css — Menu's buttons", () => {
  const BUTTONS = ["trigger", "context-trigger"] as const;
  const EVERY_BUTTON = `${SCOPE}:is(${BUTTONS.map((p) => `[data-part="${p}"]`).join(", ")})`;

  it("paints the trigger's own fill over the UA button fill", () => {
    expect(prop(topLevelDecls(`${SCOPE}[data-part="trigger"]`), "background-color")).toBe(
      "var(--background)",
    );
  });

  it("clears the UA button fill on the context trigger", () => {
    expect(prop(topLevelDecls(`${SCOPE}[data-part="context-trigger"]`), "background-color")).toBe(
      "transparent",
    );
  });

  it.each([":disabled", "[data-disabled]"])("dims both buttons on %s", (state) => {
    const decls = ruleDecls(root, `${EVERY_BUTTON}${state}`);
    expect(prop(decls, "opacity")).toBe("0.5");
    expect(prop(decls, "pointer-events")).toBe("none");
  });

  it("draws the focus ring inside both buttons", () => {
    const decls = ruleDecls(root, `${EVERY_BUTTON}:focus-visible`);
    expect(prop(decls, "outline")).toBe("2px solid var(--ring)");
    expect(prop(decls, "outline-offset")).toBe("-2px");
  });
});

/*
 * Elevation is the contract's soft drop, and the edge is the surface's own
 * 1px --border: a ring stacked in box-shadow doubled it into a 2px edge
 * (47d89e2).
 */
describe("@moderno-ui/core components.css — Menu's surface", () => {
  const CONTENT = `${SCOPE}[data-part="content"]`;

  it("edges the content with its own --border and lifts it with --shadow-md", () => {
    const decls = topLevelDecls(CONTENT);
    expect(prop(decls, "border")).toBe("1px solid var(--border)");
    expect(prop(decls, "box-shadow")).toBe("var(--shadow-md)");
    expect(prop(decls, "background-color")).toBe("var(--popover)");
    expect(prop(decls, "color")).toBe("var(--popover-foreground)");
  });

  it("takes every shadow from a --shadow-* slot, never a stacked ring", () => {
    const shadows: string[] = [];
    root.walkDecls("box-shadow", (decl) => {
      shadows.push(decl.value);
    });
    expect(shadows.length).toBeGreaterThan(0);
    for (const shadow of shadows) expect(shadow).toMatch(/^var\(--shadow-(sm|md|lg)\)$/);
  });

  it("types the items from the ui scale and weights labels from the contract", () => {
    root.walkDecls("font-size", (decl) => {
      expect(decl.value).toMatch(/^var\(--text-ui-(xs|sm|md|lg)\)$/);
    });
    root.walkDecls("font-weight", (decl) => {
      expect(decl.value).toMatch(/^var\(--font-weight-[a-z]+\)$/);
    });
  });

  it("highlights an item with --accent", () => {
    const decls = ruleDecls(
      root,
      `${SCOPE}:is([data-part="item"], [data-part="trigger-item"])[data-highlighted]`,
    );
    expect(prop(decls, "background-color")).toBe("var(--accent)");
    expect(prop(decls, "color")).toBe("var(--accent-foreground)");
  });

  it("sizes every box from spacing slots", () => {
    root.walkDecls(/^(width|height|min-width|min-height)$/, (decl) => {
      // 0 and 100% are not dimensions: a reset, and the sheet's full width.
      if (["0", "100%"].includes(decl.value)) return;
      expect(decl.value, `${decl.parent?.toString().split("{")[0]} ${decl.prop}`).toMatch(
        /^(calc\()?var\(--spacing-\d\)/,
      );
    });
  });
});

/*
 * Under a small viewport the open menu is a bottom sheet: the positioner
 * covers the viewport and paints the scrim, the same --overlay slot Dialog's
 * backdrop uses (a6876c1), and the content sits at its foot, full width.
 */
describe("@moderno-ui/core components.css — Menu as a bottom sheet", () => {
  const sheet = mediaBlock("(width < 40rem)");
  const OPEN_POSITIONER = `${SCOPE}[data-part="positioner"]:has(> [data-part="content"][data-state="open"])`;

  it("covers the viewport with the positioner while the menu is open, over Ark's inline place", () => {
    const decls = ruleDecls(sheet, OPEN_POSITIONER);
    expect(prop(decls, "position")).toBe("fixed");
    expect(prop(decls, "inset")).toBe("0");
    expect(prop(decls, "transform")).toBe("none");
    for (const name of ["position", "inset", "transform", "min-width"]) {
      expect(
        decls.find((decl) => decl.prop === name)?.important,
        `${name} beats Ark's inline style`,
      ).toBe(true);
    }
    expect(prop(decls, "justify-content")).toBe("flex-end");
  });

  it("paints the scrim from --overlay, never a literal colour or opacity", () => {
    const decls = ruleDecls(sheet, OPEN_POSITIONER);
    expect(prop(decls, "background-color")).toBe("var(--overlay)");
    expect(prop(decls, "opacity")).toBeUndefined();
  });

  it("lays the content across the viewport's foot, rounded on top only", () => {
    const decls = ruleDecls(sheet, `${SCOPE}[data-part="content"]`);
    expect(prop(decls, "width")).toBe("100%");
    expect(prop(decls, "border-width")).toBe("1px 0 0");
    expect(prop(decls, "border-radius")).toBe(
      "calc(var(--radius) * 2) calc(var(--radius) * 2) 0 0",
    );
    expect(prop(decls, "overflow-y")).toBe("auto");
  });

  it("gives every item a touch-sized row, whatever the size", () => {
    const decls = ruleDecls(
      sheet,
      `${SCOPE}[data-part="content"][data-size] ${SCOPE}:is([data-part="item"], [data-part="trigger-item"])`,
    );
    expect(prop(decls, "min-height")).toBe("calc(var(--spacing-8) + var(--spacing-3))");
  });
});

/*
 * The size rules reach down from the content. A submenu rendered without a
 * Portal sits inside its parent's content, and follows its own size.
 */
describe("@moderno-ui/core components.css — Menu's size rules", () => {
  const CONTENT = `${SCOPE}[data-part="content"]`;
  const sizeSelectors: string[] = [];
  root.walkRules((rule) => {
    if (rule.parent?.type !== "root") return;
    for (const selector of rule.selectors) {
      if (!selector.includes(`${CONTENT}[data-size=`)) continue;
      sizeSelectors.push(normalizeSelector(selector).replace(/\(\s+/g, "(").replace(/\s+\)/g, ")"));
    }
  });
  const sizeOf = (selector: string) => /\[data-size="(\w+)"\]/.exec(selector)![1]!;

  it("reads the size rules (guards the cases below from vacuous passes)", () => {
    expect(sizeSelectors).toHaveLength(2);
  });

  it.each(sizeSelectors)("stops at a nested menu of another size: %s", (selector) => {
    const size = sizeOf(selector);
    expect(selector).toContain(
      `:where(:not(${CONTENT}[data-size="${size}"] ${CONTENT}:not([data-size="${size}"]) *))`,
    );
  });
});

describe("@moderno-ui/core components.css — Menu under reduced motion", () => {
  it("drops every transition", () => {
    const calm = mediaBlock("(prefers-reduced-motion: reduce)");
    const covered = calm.first as { selector: string };
    expect(prop(ruleDecls(calm, normalizeSelector(covered.selector)), "transition")).toBe("none");
    root.walkDecls("transition", (decl) => {
      if (decl.parent?.parent?.type !== "root") return;
      const part = /\[data-part="([\w-]+)"\]/.exec((decl.parent as { selector: string }).selector);
      expect(covered.selector).toContain(`[data-part="${part![1]}"]`);
    });
  });
});
