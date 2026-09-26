import { describe, expect, it } from "vitest";
import type { Declaration, Rule } from "postcss";
import { parsePartial, prop } from "./stylesheet.ts";

const root = parsePartial("divider");

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
