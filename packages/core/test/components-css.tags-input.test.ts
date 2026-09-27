import { describe, expect, it } from "vitest";
import type { Rule } from "postcss";
import { parsePartial, prop, ruleDecls } from "./stylesheet.ts";

const root = parsePartial("tags-input");

/*
 * TagsInput's control is the bordered box that wraps the tags; the input
 * inside it draws no border or ring of its own, a tag is a chip whose corner
 * nests inside the box's, and a disabled tags input is dimmed once.
 */
describe("@moderno-ui/core components.css — TagsInput", () => {
  const SCOPE = `[data-scope="tags-input"]`;
  const ROOT = `${SCOPE}[data-part="root"]`;

  it("borders the control, not the input inside it, and lets the tags wrap", () => {
    const control = ruleDecls(root, `${SCOPE}[data-part="control"]`);
    expect(prop(control, "border")).toBe("1px solid var(--input)");
    expect(prop(control, "flex-wrap")).toBe("wrap");
    const input = ruleDecls(root, `${SCOPE}[data-part="input"]`);
    expect(prop(input, "border")).toBe("0");
    expect(prop(input, "outline")).toBe("none");
  });

  it("keeps an invalid box red under the pointer and in focus", () => {
    const hover: string[] = [];
    root.walkRules((r: Rule) => {
      for (const s of r.selectors) {
        if (s.startsWith(`${SCOPE}[data-part="control"]:hover`)) hover.push(s);
      }
    });
    expect(hover).toHaveLength(1);
    for (const state of ["[data-disabled]", "[data-invalid]", "[data-readonly]"]) {
      expect(hover[0], state).toContain(state);
    }
    expect(
      prop(
        ruleDecls(root, `${SCOPE}[data-part="control"][data-invalid]:focus-within`),
        "outline-color",
      ),
    ).toBe("var(--destructive)");
  });

  it("nests a tag's corner inside the box's and marks a highlighted tag with an inset ring", () => {
    const preview = ruleDecls(root, `${SCOPE}[data-part="item-preview"]`);
    expect(prop(preview, "border-radius")).toBe("calc(var(--radius) - var(--spacing-1) / 2)");
    expect(prop(preview, "background-color")).toBe("var(--muted)");
    const highlighted = ruleDecls(root, `${SCOPE}[data-part="item-preview"][data-highlighted]`);
    expect(prop(highlighted, "outline")).toBe("2px solid var(--ring)");
    expect(prop(highlighted, "outline-offset")).toBe("-2px");
  });

  it("clears the native button fill on both triggers", () => {
    for (const part of ["item-delete-trigger", "clear-trigger"]) {
      const decls = ruleDecls(root, `${SCOPE}[data-part="${part}"]`);
      expect(prop(decls, "background-color"), part).toBe("transparent");
      expect(prop(decls, "border"), part).toBe("0");
    }
  });

  it("dims a disabled tags input once: its parts are reset", () => {
    expect(prop(ruleDecls(root, `${ROOT}[data-disabled] :where([data-part])`), "opacity")).toBe(
      "1",
    );
  });

  it("sizes the box and each tag from spacing slots at every size", () => {
    const controls = [
      `${SCOPE}[data-part="control"]`,
      `${ROOT}[data-size="sm"] > [data-part="control"]`,
      `${ROOT}[data-size="lg"] > [data-part="control"]`,
    ];
    for (const selector of controls) {
      expect(prop(ruleDecls(root, selector), "min-height"), selector).toMatch(
        /var\(--spacing-\d\)/,
      );
    }
    const tags = [
      `${SCOPE}[data-part="item-preview"]`,
      `${ROOT}[data-size="sm"] > [data-part="control"] > [data-part="item"] > :is([data-part="item-preview"], [data-part="item-input"])`,
      `${ROOT}[data-size="lg"] > [data-part="control"] > [data-part="item"] > :is([data-part="item-preview"], [data-part="item-input"])`,
    ];
    for (const selector of tags) {
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
