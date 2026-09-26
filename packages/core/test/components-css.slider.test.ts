import { describe, expect, it } from "vitest";
import type { Rule } from "postcss";
import { parsePartial, prop, ruleDecls } from "./stylesheet.ts";

const root = parsePartial("slider");

/*
 * Slider takes every position from Ark inline: the range's inset, each
 * thumb's and marker's offset along the track, and a centring `transform`.
 * The stylesheet must centre the thumb across the track without touching
 * that transform, and bring the dragging indicator back onto its own thumb.
 */
describe("@moderno-ui/core components.css — Slider", () => {
  const ROOT = `[data-scope="slider"][data-part="root"]`;
  const THUMB = `[data-scope="slider"][data-part="thumb"]`;
  const sliderRules = () => {
    const rules: Rule[] = [];
    root.walkRules((r: Rule) => {
      if (r.selector.includes('[data-scope="slider"]')) rules.push(r);
    });
    return rules;
  };

  it("never sets transform, so Ark's inline centring along the track holds", () => {
    for (const rule of sliderRules()) {
      rule.walkDecls((d) => {
        expect(d.prop, rule.selector).not.toBe("transform");
      });
    }
  });

  it("centres the thumb across the track with translate, in both orientations", () => {
    expect(prop(ruleDecls(root, THUMB), "translate")).toBe("0 -50%");
    expect(prop(ruleDecls(root, `${THUMB}[data-orientation="vertical"]`), "translate")).toBe(
      "-50% 0",
    );
  });

  it("puts the dragging indicator back on its own thumb, for both thumbs of a range", () => {
    const decls = ruleDecls(root, `[data-scope="slider"][data-part="dragging-indicator"]`);
    expect(prop(decls, "--slider-thumb-offset-0")).toBe("50%");
    expect(prop(decls, "--slider-thumb-offset-1")).toBe("50%");
  });

  it("sizes the thumb from spacing slots at every size", () => {
    const thumbs = [
      THUMB,
      `${ROOT}[data-size="sm"] > [data-part="control"] > [data-part="thumb"]`,
      `${ROOT}[data-size="lg"] > [data-part="control"] > [data-part="thumb"]`,
    ];
    for (const selector of thumbs) {
      const decls = ruleDecls(root, selector);
      expect(prop(decls, "width"), selector).toMatch(/^var\(--spacing-\d\)$/);
      expect(prop(decls, "height"), selector).toBe(prop(decls, "width"));
    }
  });

  it("dims a disabled slider once: its parts are reset", () => {
    expect(prop(ruleDecls(root, `${ROOT}[data-disabled] :where([data-part])`), "opacity")).toBe(
      "1",
    );
  });

  it("reaches its parts through child combinators", () => {
    const sizeRules: string[] = [];
    for (const r of sliderRules()) {
      for (const s of r.selectors) {
        if (s.includes(`${ROOT}[data-size=`)) sizeRules.push(s.replace(/\s+/g, " "));
      }
    }
    expect(sizeRules.length).toBeGreaterThan(0);
    for (const s of sizeRules) {
      expect(s, s).not.toMatch(/\] \[data-part/);
    }
  });
});
