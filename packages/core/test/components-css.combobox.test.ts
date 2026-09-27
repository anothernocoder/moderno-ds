import { describe, expect, it } from "vitest";
import type { Rule } from "postcss";
import { parsePartial, prop, ruleDecls } from "./stylesheet.ts";

const root = parsePartial("combobox");

/*
 * Combobox's control is the bordered box around the input and its buttons;
 * the input draws no border or ring of its own. The list is a floating
 * surface lifted by the --shadow-md slot alone, over its own 1px --border.
 */
describe("@moderno-ui/core components.css — Combobox", () => {
  const SCOPE = `[data-scope="combobox"]`;
  const ROOT = `${SCOPE}[data-part="root"]`;
  const BUTTONS = `${SCOPE}:is([data-part="trigger"], [data-part="clear-trigger"])`;

  it("borders the control, not the input inside it", () => {
    const control = ruleDecls(root, `${SCOPE}[data-part="control"]`);
    expect(prop(control, "border")).toBe("1px solid var(--input)");
    expect(prop(control, "height")).toBe("var(--spacing-8)");
    const input = ruleDecls(root, `${SCOPE}[data-part="input"]`);
    expect(prop(input, "border")).toBe("0");
    expect(prop(input, "outline")).toBe("none");
    expect(prop(input, "font-size")).toBe("var(--text-ui-md)");
  });

  it("keeps an invalid box red under the pointer and in focus", () => {
    const hover: string[] = [];
    root.walkRules((r: Rule) => {
      for (const s of r.selectors) {
        if (s.startsWith(`${SCOPE}[data-part="control"]:hover`)) hover.push(s);
      }
    });
    expect(hover).toHaveLength(1);
    for (const state of ["[data-disabled]", "[data-invalid]"]) {
      expect(hover[0], state).toContain(state);
    }
    expect(
      prop(
        ruleDecls(root, `${SCOPE}[data-part="control"][data-invalid]:focus-within`),
        "outline-color",
      ),
    ).toBe("var(--destructive)");
  });

  it("lifts the list with the shadow slot as it is, over its own border", () => {
    const content = ruleDecls(root, `${SCOPE}[data-part="content"]`);
    expect(prop(content, "border")).toBe("1px solid var(--border)");
    expect(prop(content, "box-shadow")).toBe("var(--shadow-md)");
    expect(prop(content, "background-color")).toBe("var(--popover)");
    expect(prop(content, "min-width")).toBe("var(--reference-width)");
    expect(prop(content, "overflow-y")).toBe("auto");
  });

  it("marks the highlighted item with the accent fill and a checked one by weight", () => {
    const highlighted = ruleDecls(root, `${SCOPE}[data-part="item"][data-highlighted]`);
    expect(prop(highlighted, "background-color")).toBe("var(--accent)");
    expect(prop(highlighted, "color")).toBe("var(--accent-foreground)");
    const checked = ruleDecls(root, `${SCOPE}[data-part="item"][data-state="checked"]`);
    expect(prop(checked, "font-weight")).toBe("var(--font-weight-semibold)");
  });

  it("sets the empty state in the muted colour", () => {
    expect(prop(ruleDecls(root, `${SCOPE}[data-part="empty"]`), "color")).toBe(
      "var(--muted-foreground)",
    );
  });

  it("clears the native button fill on the trigger and the clear trigger", () => {
    const buttons = ruleDecls(root, BUTTONS);
    expect(prop(buttons, "background-color")).toBe("transparent");
    expect(prop(buttons, "border")).toBe("0");
  });

  it("dims a disabled control once: its parts are reset", () => {
    expect(
      prop(
        ruleDecls(root, `${SCOPE}[data-part="control"][data-disabled] :where([data-part])`),
        "opacity",
      ),
    ).toBe("1");
  });

  /*
   * Ark stamps data-disabled on a disabled item and on its item-text; the base
   * layer dims each, so without a reset the label multiplies to 0.25.
   */
  it("dims a disabled item once: its parts are reset", () => {
    expect(
      prop(
        ruleDecls(root, `${SCOPE}[data-part="item"][data-disabled] :where([data-part])`),
        "opacity",
      ),
    ).toBe("1");
  });

  it("sizes the box from spacing slots and the type from --text-ui-* at every size", () => {
    const controls = [
      `${SCOPE}[data-part="control"]`,
      `${ROOT}[data-size="sm"] > [data-part="control"]`,
      `${ROOT}[data-size="lg"] > [data-part="control"]`,
    ];
    for (const selector of controls) {
      expect(prop(ruleDecls(root, selector), "height"), selector).toMatch(/var\(--spacing-\d\)/);
    }
    const inputs = [
      `${SCOPE}[data-part="input"]`,
      `${ROOT}[data-size="sm"] > [data-part="control"] > [data-part="input"]`,
      `${ROOT}[data-size="lg"] > [data-part="control"] > [data-part="input"]`,
    ];
    for (const selector of inputs) {
      expect(prop(ruleDecls(root, selector), "font-size"), selector).toMatch(
        /^var\(--text-ui-(sm|md|lg)\)$/,
      );
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
