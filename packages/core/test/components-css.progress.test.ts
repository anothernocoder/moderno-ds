import { describe, expect, it } from "vitest";
import type { Declaration, Rule } from "postcss";
import { parsePartial, prop, ruleDecls } from "./stylesheet.ts";

const root = parsePartial("progress");

/*
 * Progress takes its percentage from Ark inline (the range's width, the
 * circle-range's stroke offset) and its circle's geometry from --size and
 * --thickness, which Ark reads and the stylesheet sets. A null value is
 * indeterminate: Ark sets no width, so the stylesheet must animate one.
 */
describe("@moderno-ui/core components.css — Progress", () => {
  const ROOT = `[data-scope="progress"][data-part="root"]`;
  const RANGE = `[data-scope="progress"][data-part="range"]`;
  const CIRCLE_RANGE = `[data-scope="progress"][data-part="circle-range"]`;

  it("sets the circle's --size and --thickness from spacing slots at every size", () => {
    const circles = [
      `[data-scope="progress"][data-part="circle"]`,
      `${ROOT}[data-size="sm"] > [data-part="circle"]`,
      `${ROOT}[data-size="lg"] > [data-part="circle"]`,
    ];
    for (const selector of circles) {
      const decls = ruleDecls(root, selector);
      expect(prop(decls, "--size"), selector).toMatch(/var\(--spacing-/);
      expect(prop(decls, "--thickness"), selector).toMatch(/var\(--spacing-/);
    }
  });

  it("gives an indeterminate range a width of its own and an endless animation", () => {
    const linear = ruleDecls(root, `${RANGE}[data-state="indeterminate"]`);
    expect(prop(linear, "width")).toBeDefined();
    expect(prop(linear, "animation")).toMatch(/^moderno-progress-slide .* infinite$/);
    const circular = ruleDecls(root, `${CIRCLE_RANGE}[data-state="indeterminate"]`);
    expect(prop(circular, "stroke-dasharray")).toMatch(/var\(--circumference\)/);
    expect(prop(circular, "animation")).toMatch(/^moderno-progress-spin .* infinite$/);
  });

  it("mirrors the indeterminate slide in right-to-left instead of replaying it backwards", () => {
    const translateX = (name: string, step: "from" | "to") => {
      let value: string | undefined;
      root.walkAtRules("keyframes", (at) => {
        if (at.params !== name) return;
        at.walkRules((r) => {
          if (r.selector === step) value = prop(r.nodes as Declaration[], "translate");
        });
      });
      return value?.split(/\s+/)[0];
    };
    const mirrored = (x: string | undefined) => (x?.startsWith("-") ? x.slice(1) : `-${x}`);

    const rtl = ruleDecls(
      root,
      `${RANGE}[data-orientation="horizontal"][data-state="indeterminate"][dir="rtl"]`,
    );
    expect(prop(rtl, "animation-name")).toBe("moderno-progress-slide-rtl");
    expect(prop(rtl, "animation-direction")).toBeUndefined();
    for (const step of ["from", "to"] as const) {
      const ltrX = translateX("moderno-progress-slide", step);
      expect(ltrX, step).toBeDefined();
      expect(translateX("moderno-progress-slide-rtl", step), step).toBe(mirrored(ltrX));
    }
  });

  it("slows the indeterminate animations under reduced motion instead of stopping them", () => {
    const slowed: string[] = [];
    root.walkAtRules("media", (at) => {
      if (!at.params.includes("prefers-reduced-motion")) return;
      at.walkRules((r) => {
        if (!r.selector.includes('[data-scope="progress"]')) return;
        r.walkDecls((d) => {
          if (d.prop === "animation" && d.value === "none") slowed.push(`stopped: ${r.selector}`);
          if (d.prop === "animation-duration") slowed.push(r.selector);
        });
      });
    });
    expect(slowed).toEqual([
      `${RANGE}[data-state="indeterminate"]`,
      `${CIRCLE_RANGE}[data-state="indeterminate"]`,
    ]);
  });

  it("reaches its parts through child combinators", () => {
    const sizeRules: string[] = [];
    root.walkRules((r: Rule) => {
      for (const s of r.selectors) {
        if (s.includes(`${ROOT}[data-size=`)) sizeRules.push(s.replace(/\s+/g, " "));
      }
    });
    expect(sizeRules.length).toBeGreaterThan(0);
    for (const s of sizeRules) {
      expect(s, s).not.toMatch(/\] \[data-part/);
    }
  });
});
