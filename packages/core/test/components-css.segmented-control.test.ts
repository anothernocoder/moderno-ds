import { describe, expect, it } from "vitest";
import type { Rule } from "postcss";
import { parsePartial, prop, ruleDecls } from "./stylesheet.ts";

const root = parsePartial("segmented-control");

const ROOT = `[data-scope="segment-group"][data-part="root"]`;
const ITEM = `${ROOT} > [data-part="item"]`;
const INDICATOR = `${ROOT} > [data-part="indicator"]`;

/** Declarations of `selector` inside `@media (prefers-reduced-motion: reduce)`. */
function reducedMotionDecls(selector: string) {
  const found: { prop: string; value: string }[] = [];
  root.walkAtRules("media", (media) => {
    if (!media.params.includes("prefers-reduced-motion: reduce")) return;
    media.walkRules((rule) => {
      if (rule.selectors.map((s) => s.replace(/\s+/g, " ").trim()).includes(selector)) {
        rule.walkDecls((decl) => void found.push({ prop: decl.prop, value: decl.value }));
      }
    });
  });
  return found;
}

describe("@moderno-ui/core components.css — SegmentedControl", () => {
  it("sizes the indicator from the box Ark measures, over the checked segment", () => {
    const decls = ruleDecls(root, INDICATOR);
    expect(prop(decls, "top")).toBe("var(--top)");
    expect(prop(decls, "width")).toBe("var(--width)");
    expect(prop(decls, "height")).toBe("var(--height)");
    expect(prop(decls, "--transition-duration")).toBe("var(--motion-fast)");
  });

  it("does not slide the indicator under prefers-reduced-motion", () => {
    expect(reducedMotionDecls(INDICATOR)).toEqual([
      { prop: "--transition-duration", value: "0ms" },
    ]);
  });

  it("marks the selection by shape, not colour alone: an edged, raised pill", () => {
    const decls = ruleDecls(root, INDICATOR);
    expect(prop(decls, "border")).toBe("1px solid var(--border)");
    expect(prop(decls, "box-shadow")).toBe("var(--shadow-sm)");
  });

  it("gives the checked segment the pill itself while no indicator shows", () => {
    const decls = ruleDecls(
      root,
      `${ROOT}:not(:has(> [data-part="indicator"]:not([hidden]))) > [data-part="item"][data-state="checked"]`,
    );
    expect(prop(decls, "border-color")).toBe("var(--border)");
    expect(prop(decls, "background-color")).toBe("var(--background)");
  });

  it("matches Field's input heights: sm, md and lg", () => {
    expect(prop(ruleDecls(root, ROOT), "height")).toBe("var(--spacing-8)");
    expect(prop(ruleDecls(root, `${ROOT}[data-size="sm"]`), "height")).toBe("var(--spacing-7)");
    expect(prop(ruleDecls(root, `${ROOT}[data-size="lg"]`), "height")).toBe(
      "calc(var(--spacing-8) + var(--spacing-2))",
    );
  });

  it("shares the width evenly between segments when fullWidth", () => {
    expect(prop(ruleDecls(root, `${ROOT}[data-full-width]`), "width")).toBe("100%");
    expect(prop(ruleDecls(root, `${ROOT}[data-full-width] > [data-part="item"]`), "flex")).toBe(
      "1 1 0",
    );
  });

  it("cuts a long label with an ellipsis instead of breaking the track", () => {
    expect(prop(ruleDecls(root, ITEM), "min-width")).toBe("0");
    const text = ruleDecls(root, `[data-scope="segment-group"][data-part="item-text"]`);
    expect(prop(text, "text-overflow")).toBe("ellipsis");
    expect(prop(text, "white-space")).toBe("nowrap");
    expect(prop(text, "overflow")).toBe("hidden");
  });

  it("rings the focused segment inside its edge", () => {
    const decls = ruleDecls(root, `${ITEM}[data-focus-visible]`);
    expect(prop(decls, "outline-color")).toBe("var(--ring)");
    expect(prop(decls, "outline-offset")).toBe("-2px");
  });

  it("reaches its segments through child combinators, so a nested control keeps its own size", () => {
    const sized: string[] = [];
    root.walkRules((r: Rule) => {
      for (const s of r.selectors) {
        if (/\[data-size=/.test(s)) sized.push(s.replace(/\s+/g, " "));
      }
    });
    expect(sized.length).toBeGreaterThan(0);
    for (const s of sized) expect(s, s).not.toMatch(/\] \[data-part/);
  });
});
