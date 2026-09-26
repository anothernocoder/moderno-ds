import { describe, expect, it } from "vitest";
import type { Rule } from "postcss";
import { parsePartial, prop, ruleDecls } from "./stylesheet.ts";

const root = parsePartial("tabs");

/*
 * A Tabs trigger is a native <button role="tab">, so the same two browser
 * defaults leak through: the UA `buttonface` fill (a tab has no fill of its
 * own — the enclosed pill is the indicator behind it) and a native `disabled`
 * set without Ark, or before it hydrates, which carries no `data-disabled`.
 */
describe("@moderno-ui/core components.css — Tabs", () => {
  const TRIGGER = `[data-scope="tabs"][data-part="trigger"]`;

  it("clears the UA button fill on the trigger", () => {
    expect(prop(ruleDecls(root, TRIGGER), "background-color")).toBe("transparent");
  });

  it("dims and disables a native :disabled trigger like [data-disabled]", () => {
    const decls = ruleDecls(root, `${TRIGGER}:disabled`);
    expect(prop(decls, "opacity")).toBe("0.5");
    expect(prop(decls, "pointer-events")).toBe("none");
  });

  it("sizes the indicator from the box Ark measures", () => {
    const line = ruleDecls(
      root,
      `[data-scope="tabs"][data-part="root"][data-variant="line"] > [data-part="list"] > [data-part="indicator"]`,
    );
    expect(prop(line, "width")).toBe("var(--width)");
    const enclosed = ruleDecls(
      root,
      `[data-scope="tabs"][data-part="root"][data-variant="enclosed"] > [data-part="list"] > [data-part="indicator"]`,
    );
    expect(prop(enclosed, "width")).toBe("var(--width)");
    expect(prop(enclosed, "height")).toBe("var(--height)");
  });

  it("reaches the list and its parts through child combinators, so a nested Tabs keeps its own look", () => {
    const variantRules: string[] = [];
    root.walkRules((r: Rule) => {
      for (const s of r.selectors) {
        if (/\[data-scope="tabs"\]\[data-part="root"\]\[data-(variant|size)=/.test(s)) {
          variantRules.push(s.replace(/\s+/g, " "));
        }
      }
    });
    expect(variantRules.length).toBeGreaterThan(0);
    for (const s of variantRules) {
      expect(s, s).not.toMatch(/\] \[data-part/);
    }
  });
});
