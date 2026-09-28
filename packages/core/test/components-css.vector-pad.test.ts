import { describe, expect, it } from "vitest";
import type { Rule } from "postcss";
import { parsePartial, prop, ruleDecls } from "./stylesheet.ts";

const root = parsePartial("vector-pad");

/*
 * VectorPad takes the handle's place from its machine: --vector-pad-x and
 * --vector-pad-y on the root, from the pad's left and top edges. The
 * stylesheet keeps the pad square and centres the handle on that spot.
 */
describe("@moderno-ui/core components.css — VectorPad", () => {
  const SCOPE = `[data-scope="vector-pad"]`;
  const ROOT = `${SCOPE}[data-part="root"]`;
  const rules = () => {
    const found: Rule[] = [];
    root.walkRules((r: Rule) => {
      found.push(r);
    });
    return found;
  };

  it("keeps the pad square at any width", () => {
    const decls = ruleDecls(root, `${SCOPE}[data-part="control"]`);
    expect(prop(decls, "aspect-ratio")).toBe("1");
    expect(prop(decls, "max-width")).toBe("100%");
    expect(prop(decls, "height")).toBeUndefined();
    expect(prop(decls, "position")).toBe("relative");
  });

  it("centres the handle on the spot the machine sets", () => {
    const decls = ruleDecls(root, `${SCOPE}[data-part="thumb"]`);
    expect(prop(decls, "position")).toBe("absolute");
    expect(prop(decls, "left")).toBe("var(--vector-pad-x)");
    expect(prop(decls, "top")).toBe("var(--vector-pad-y)");
    expect(prop(decls, "translate")).toBe("-50% -50%");
  });

  it("rings the focused handle", () => {
    const decls = ruleDecls(root, `${SCOPE}[data-part="thumb"]:focus-visible`);
    expect(prop(decls, "outline-color")).toBe("var(--ring)");
    expect(prop(decls, "outline-style")).toBe("solid");
  });

  it("lets a press on the grid or the crosshair through to the pad", () => {
    for (const part of ["grid", "crosshair"]) {
      const decls = ruleDecls(root, `${SCOPE}[data-part="${part}"]`);
      expect(prop(decls, "pointer-events"), part).toBe("none");
      expect(prop(decls, "inset"), part).toBe("0");
    }
  });

  it("sizes the pad as five field heights at every size", () => {
    const pads: [string, string][] = [
      [`${SCOPE}[data-part="control"]`, "calc(var(--spacing-8) * 5)"],
      [`${ROOT}[data-size="sm"] > [data-part="control"]`, "calc(var(--spacing-7) * 5)"],
      [
        `${ROOT}[data-size="lg"] > [data-part="control"]`,
        "calc((var(--spacing-8) + var(--spacing-2)) * 5)",
      ],
    ];
    for (const [selector, size] of pads) {
      expect(prop(ruleDecls(root, selector), "width"), selector).toBe(size);
    }
  });

  it("dims a disabled vector pad once: its parts are reset", () => {
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
