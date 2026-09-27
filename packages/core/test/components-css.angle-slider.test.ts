import { describe, expect, it } from "vitest";
import type { Rule } from "postcss";
import { parsePartial, prop, ruleDecls } from "./stylesheet.ts";

const root = parsePartial("angle-slider");

/*
 * AngleSlider takes every rotation from Ark inline: `rotate` on the thumb
 * and on each marker. The stylesheet draws the dial around them, and must
 * never set a rotation of its own.
 */
describe("@moderno-ui/core components.css — AngleSlider", () => {
  const SCOPE = `[data-scope="angle-slider"]`;
  const ROOT = `${SCOPE}[data-part="root"]`;
  const rules = () => {
    const found: Rule[] = [];
    root.walkRules((r: Rule) => {
      found.push(r);
    });
    return found;
  };

  it("never sets rotate or transform, so Ark's inline rotation holds", () => {
    for (const rule of rules()) {
      rule.walkDecls((d) => {
        expect(d.prop, rule.selector).not.toBe("rotate");
        expect(d.prop, rule.selector).not.toBe("transform");
      });
    }
  });

  it("turns the thumb and each marker around the dial's centre: both cover it", () => {
    for (const part of ["thumb", "marker"]) {
      expect(prop(ruleDecls(root, `${SCOPE}[data-part="${part}"]`), "inset"), part).toBe("0");
    }
    expect(prop(ruleDecls(root, `${SCOPE}[data-part="control"]`), "position")).toBe("relative");
  });

  it("lets a press on the needle through to the dial, so it sets the angle", () => {
    expect(prop(ruleDecls(root, `${SCOPE}[data-part="thumb"]`), "pointer-events")).toBe("none");
  });

  it("rings the focused thumb, which circles the dial", () => {
    const decls = ruleDecls(root, `${SCOPE}[data-part="thumb"]:focus-visible`);
    expect(prop(decls, "outline-color")).toBe("var(--ring)");
    expect(prop(decls, "outline-style")).toBe("solid");
    expect(prop(ruleDecls(root, `${SCOPE}[data-part="thumb"]`), "border-radius")).toBe(
      "var(--radius-full)",
    );
  });

  it("sizes the dial as two field heights at every size, round", () => {
    const dials: [string, string][] = [
      [`${SCOPE}[data-part="control"]`, "calc(var(--spacing-8) * 2)"],
      [`${ROOT}[data-size="sm"] > [data-part="control"]`, "calc(var(--spacing-7) * 2)"],
      [
        `${ROOT}[data-size="lg"] > [data-part="control"]`,
        "calc((var(--spacing-8) + var(--spacing-2)) * 2)",
      ],
    ];
    for (const [selector, size] of dials) {
      const decls = ruleDecls(root, selector);
      expect(prop(decls, "width"), selector).toBe(size);
      expect(prop(decls, "height"), selector).toBe(size);
    }
  });

  it("dims a disabled angle slider once: its parts are reset", () => {
    expect(prop(ruleDecls(root, `${ROOT}[data-disabled] :where([data-part])`), "opacity")).toBe(
      "1",
    );
  });

  it("reaches its parts through child combinators", () => {
    const sizeRules: string[] = [];
    for (const r of rules()) {
      for (const s of r.selectors) {
        if (s.includes(`${ROOT}[data-size=`)) sizeRules.push(s.replace(/\s+/g, " "));
      }
    }
    expect(sizeRules.length).toBeGreaterThan(0);
    for (const s of sizeRules) {
      expect(s, s).not.toMatch(/\] \[data-/);
    }
  });
});
