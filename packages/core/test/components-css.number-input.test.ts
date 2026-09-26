import { describe, expect, it } from "vitest";
import type { Rule } from "postcss";
import { parsePartial, prop, ruleDecls } from "./stylesheet.ts";

const root = parsePartial("number-input");

/*
 * NumberInput's control is the bordered box; the input inside it and the
 * steppers draw no border or ring of their own, and a disabled number input
 * is dimmed once.
 */
describe("@moderno-ui/core components.css — NumberInput", () => {
  const SCOPE = `[data-scope="number-input"]`;
  const ROOT = `${SCOPE}[data-part="root"]`;

  it("borders the control, not the input inside it", () => {
    expect(prop(ruleDecls(root, `${SCOPE}[data-part="control"]`), "border")).toBe(
      "1px solid var(--input)",
    );
    const input = ruleDecls(root, `${SCOPE}[data-part="input"]`);
    expect(prop(input, "border")).toBe("0");
    expect(prop(input, "outline")).toBe("none");
  });

  it("clears the native button fill on both steppers and dims them on :disabled too", () => {
    for (const part of ["decrement-trigger", "increment-trigger"]) {
      const selector = `${SCOPE}[data-part="${part}"]`;
      expect(prop(ruleDecls(root, selector), "background-color"), part).toBe("transparent");
      expect(prop(ruleDecls(root, `${selector}:disabled`), "opacity"), part).toBe("0.5");
      expect(prop(ruleDecls(root, `${selector}[data-disabled]`), "opacity"), part).toBe("0.5");
    }
  });

  it("dims a disabled number input once: its parts are reset", () => {
    expect(prop(ruleDecls(root, `${ROOT}[data-disabled] :where([data-part])`), "opacity")).toBe(
      "1",
    );
  });

  it("sizes the box from spacing slots at every size", () => {
    const controls = [
      `${SCOPE}[data-part="control"]`,
      `${ROOT}[data-size="sm"] > [data-part="control"]`,
      `${ROOT}[data-size="lg"] > [data-part="control"]`,
    ];
    for (const selector of controls) {
      expect(prop(ruleDecls(root, selector), "height"), selector).toMatch(/var\(--spacing-\d\)/);
    }
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
