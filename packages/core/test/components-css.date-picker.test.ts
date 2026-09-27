import { describe, expect, it } from "vitest";
import type { AtRule, Declaration, Rule } from "postcss";
import { parsePartial, prop } from "./stylesheet.ts";

const root = parsePartial("date-picker");

/** A selector with the spaces prettier puts inside `:is(…)` / `:not(…)` taken out. */
const tight = (selector: string) =>
  selector.replace(/\s+/g, " ").replace(/\(\s/g, "(").replace(/\s\)/g, ")").trim();

/** Declarations of every rule whose selector list holds exactly `selector`. */
function ruleDecls(selector: string): Declaration[] {
  const found: Declaration[] = [];
  root.walkRules((rule: Rule) => {
    if (!rule.selectors.map(tight).includes(selector)) return;
    rule.walkDecls((decl) => {
      found.push(decl);
    });
  });
  return found;
}

/*
 * DatePicker is two surfaces. The control is a bordered box like Number
 * Input's: the inputs and buttons inside it draw no border or ring of their
 * own, and the box rings inside itself. The calendar floats over the page, so
 * its contract is the elevation one: the popover fill, a 1px --border edge and
 * a soft --shadow-* drop — never a ring stacked into box-shadow (47d89e2).
 */
describe("@moderno-ui/core components.css — DatePicker", () => {
  const SCOPE = `[data-scope="date-picker"]`;
  const ROOT = `${SCOPE}[data-part="root"]`;
  const CONTENT = `${SCOPE}[data-part="content"]`;
  const DAY = `${SCOPE}[data-part="table-cell-trigger"]`;

  /** Every declaration in the partial, with the selector it sits under. */
  const decls: { selector: string; decl: Declaration }[] = [];
  root.walkRules((rule: Rule) => {
    rule.walkDecls((decl) => {
      decls.push({ selector: tight(rule.selector), decl });
    });
  });

  it("borders the control, not the input inside it", () => {
    expect(prop(ruleDecls(`${SCOPE}[data-part="control"]`), "border")).toBe(
      "1px solid var(--input)",
    );
    const input = ruleDecls(`${SCOPE}[data-part="input"]`);
    expect(prop(input, "border")).toBe("0");
    expect(prop(input, "outline")).toBe("none");
  });

  it("rings the control inside its box, red while an input is invalid", () => {
    const focus = ruleDecls(`${SCOPE}[data-part="control"]:focus-within`);
    expect(prop(focus, "outline")).toBe("2px solid var(--ring)");
    expect(prop(focus, "outline-offset")).toBe("-2px");
    const invalid = `${SCOPE}[data-part="control"]:has(> [data-invalid])`;
    expect(prop(ruleDecls(invalid), "border-color")).toBe("var(--destructive)");
    expect(prop(ruleDecls(`${invalid}:focus-within`), "outline-color")).toBe("var(--destructive)");
  });

  it("rings every bordered control and calendar button inside its box", () => {
    const rings = decls.filter(({ decl }) => decl.prop === "outline-offset");
    expect(rings.length).toBeGreaterThan(2);
    for (const { selector, decl } of rings) {
      expect(decl.value, selector).toBe("-2px");
    }
  });

  it("clears the native button fill on the trigger and the clear trigger", () => {
    const trigger = ruleDecls(`${SCOPE}:is([data-part="trigger"], [data-part="clear-trigger"])`);
    expect(prop(trigger, "background-color")).toBe("transparent");
    expect(prop(trigger, "border")).toBe("0");
  });

  it("shows a focused trigger by its fill, not a second ring inside the ringed box", () => {
    const focused = ruleDecls(
      `${SCOPE}:is([data-part="trigger"], [data-part="clear-trigger"]):focus-visible`,
    );
    expect(prop(focused, "background-color")).toBe("var(--accent)");
    expect(prop(focused, "outline")).toBe("none");
  });

  it("clears the UA button look on a day, which Svelte renders as a <button>", () => {
    const day = ruleDecls(DAY);
    expect(prop(day, "padding")).toBe("0");
    expect(prop(day, "border")).toBe("0");
    expect(prop(day, "background-color")).toBe("transparent");
    expect(prop(day, "font")).toBe("inherit");
  });

  it("sits every cell flush, keyed on the row: Svelte's cells carry no part", () => {
    expect(prop(ruleDecls(`${SCOPE}[data-part="table-row"] > *`), "padding")).toBe("0");
  });

  it("dims a disabled date picker once: its parts are reset", () => {
    expect(prop(ruleDecls(`${ROOT}[data-disabled] :where([data-part])`), "opacity")).toBe("1");
  });

  it("draws the calendar from the popover slots with a 1px --border edge", () => {
    const content = ruleDecls(CONTENT);
    expect(prop(content, "background-color")).toBe("var(--popover)");
    expect(prop(content, "color")).toBe("var(--popover-foreground)");
    expect(prop(content, "border")).toBe("1px solid var(--border)");
    expect(prop(content, "border-radius")).toBe("var(--radius)");
  });

  it("lifts it with one --shadow-* slot as it is, never a ring in box-shadow", () => {
    const shadows = decls.filter(({ decl }) => decl.prop === "box-shadow");
    expect(shadows.map(({ decl }) => decl.value)).toEqual(["var(--shadow-md)", "none"]);
    // `none` is the inline calendar, which sits in the page.
    expect(prop(ruleDecls(`${CONTENT}[data-inline]`), "box-shadow")).toBe("none");
  });

  it("leaves the positioner to floating-ui", () => {
    expect(decls.filter(({ selector }) => selector.includes(`[data-part="positioner"]`))).toEqual(
      [],
    );
  });

  it("fills a picked day with --primary and a range's inside with --accent", () => {
    const selected = ruleDecls(`${DAY}[data-selected]`);
    expect(prop(selected, "background-color")).toBe("var(--primary)");
    expect(prop(selected, "color")).toBe("var(--primary-foreground)");
    const band = ruleDecls(`${DAY}:is([data-in-range], [data-in-hover-range])`);
    expect(prop(band, "background-color")).toBe("var(--accent)");
    // Rounded all round except inside a band.
    expect(
      prop(ruleDecls(`${DAY}:not([data-in-range], [data-in-hover-range])`), "border-radius"),
    ).toBe("var(--radius)");
  });

  it("keeps a picked day's fill under the pointer", () => {
    const hover = decls.filter(
      ({ selector, decl }) =>
        selector.startsWith(`${DAY}:hover`) && decl.prop === "background-color",
    );
    expect(hover).toHaveLength(1);
    expect(hover[0]!.selector).toContain("[data-selected]");
  });

  it("steps the box and the calendar per size, from the contract slots", () => {
    const controls = [
      `${SCOPE}[data-part="control"]`,
      `${ROOT}[data-size="sm"] > [data-part="control"]`,
      `${ROOT}[data-size="lg"] > [data-part="control"]`,
    ];
    for (const selector of controls) {
      expect(prop(ruleDecls(selector), "height"), selector).toMatch(/var\(--spacing-\d\)/);
    }
    expect(prop(ruleDecls(CONTENT), "font-size")).toBe("var(--text-ui-md)");
    expect(prop(ruleDecls(`${CONTENT}[data-size="sm"]`), "font-size")).toBe("var(--text-ui-sm)");
    expect(prop(ruleDecls(`${CONTENT}[data-size="lg"]`), "font-size")).toBe("var(--text-ui-lg)");
  });

  it("reaches the root's parts through child combinators", () => {
    const sizeRules = decls
      .map(({ selector }) => selector)
      .filter((selector) => selector.includes(`${ROOT}[data-size=`));
    expect(sizeRules.length).toBeGreaterThan(0);
    for (const selector of sizeRules) {
      expect(selector, selector).not.toMatch(/\] \[data-part/);
    }
  });

  it("takes every length, type size and weight from a slot (or zero)", () => {
    const LENGTH =
      /^(padding.*|gap|width|height|min-width|font-size|line-height|font-weight|border-.*radius)$/;
    const SLOT = /var\(--(spacing-\d|text-ui-[a-z]+|leading-ui-[a-z]+|font-weight-[a-z]+|radius)\)/;
    let checked = 0;
    for (const { selector, decl } of decls) {
      if (!LENGTH.test(decl.prop)) continue;
      checked++;
      const value = decl.value;
      if (value === "0" || value === "100%" || value === "1") continue;
      // Every number left once the slots are taken out is a unit-less factor.
      const leftover = value.replace(new RegExp(SLOT.source, "g"), "");
      expect(value, `${selector} { ${decl.prop} }`).toMatch(SLOT);
      expect(leftover, `${selector} { ${decl.prop} }`).not.toMatch(/\d(px|rem|em|%)/);
    }
    expect(checked).toBeGreaterThan(20);
  });

  it("names no viewport in a media query: only the reduced-motion preference", () => {
    const queries: string[] = [];
    root.walkAtRules("media", (rule: AtRule) => {
      queries.push(rule.params);
    });
    expect(queries).toEqual(["(prefers-reduced-motion: reduce)"]);
  });
});
