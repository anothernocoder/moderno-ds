import { describe, expect, it } from "vitest";
import type { Declaration, Rule } from "postcss";
import { parsePartial, prop } from "./stylesheet.ts";

const root = parsePartial("color-picker");

/** A selector with the spaces prettier puts inside `:is(…)` taken out. */
const tight = (selector: string) =>
  selector.replace(/\s+/g, " ").replace(/\(\s/g, "(").replace(/\s\)/g, ")").trim();

/** Declarations of every rule whose selector list holds exactly `selector`. */
function decls(selector: string): Declaration[] {
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
 * ColorPicker is two surfaces. The trigger is a bordered box like Select's
 * and rings inside itself. The popover floats over the page, so its contract
 * is the elevation one: the popover fill, a 1px --border edge and a soft
 * --shadow-* drop. Ark paints every colour inline; the partial only sizes,
 * rings and centres, and shows a see-through colour over a checkerboard of
 * two tokens.
 */
describe("@moderno-ui/core components.css — ColorPicker", () => {
  const SCOPE = `[data-scope="color-picker"]`;
  const CONTENT = `${SCOPE}[data-part="content"]`;
  const TRIGGER = `${SCOPE}[data-part="trigger"]`;
  const THUMBS = `${SCOPE}:is([data-part="area-thumb"], [data-part="channel-slider-thumb"])`;

  /** Every declaration in the partial, with the selector it sits under. */
  const all: { selector: string; decl: Declaration }[] = [];
  root.walkRules((rule: Rule) => {
    rule.walkDecls((decl) => {
      all.push({ selector: tight(rule.selector), decl });
    });
  });

  it("borders the trigger and rings it inside its box", () => {
    expect(prop(decls(TRIGGER), "border")).toBe("1px solid var(--input)");
    const focus = decls(`${TRIGGER}:focus-visible`);
    expect(prop(focus, "outline")).toBe("2px solid var(--ring)");
    expect(prop(focus, "outline-offset")).toBe("-2px");
  });

  it("turns the trigger red inside an invalid Field", () => {
    expect(prop(decls(`${TRIGGER}[data-invalid]`), "border-color")).toBe("var(--destructive)");
    expect(prop(decls(`${TRIGGER}[data-invalid]:focus-visible`), "outline-color")).toBe(
      "var(--destructive)",
    );
  });

  it("gives every thumb a visible focus ring", () => {
    const focus = decls(`${THUMBS}:focus-visible`);
    expect(prop(focus, "outline")).toBe("2px solid var(--ring)");
    expect(prop(focus, "outline-offset")).toBe("2px");
  });

  it("rings the hex box and the eyedropper inside their boxes, and each swatch", () => {
    const boxes = decls(
      `${SCOPE}:is([data-part="hex-input"], [data-part="eye-dropper-trigger"]):focus-visible`,
    );
    expect(prop(boxes, "outline")).toBe("2px solid var(--ring)");
    expect(prop(boxes, "outline-offset")).toBe("-2px");
    expect(prop(decls(`${SCOPE}[data-part="swatch-trigger"]:focus-visible`), "outline")).toBe(
      "2px solid var(--ring)",
    );
  });

  it("shows a see-through colour over a checkerboard of two tokens", () => {
    const checkerboard =
      /^repeating-conic-gradient\(var\(--muted\) 0% 25%, var\(--background\) 0% 50%\)/;
    for (const part of [
      `${SCOPE}[data-part="swatch"]::before`,
      `${SCOPE}[data-part="channel-slider"][data-channel="alpha"]`,
    ]) {
      expect(prop(decls(part), "background"), part).toMatch(checkerboard);
    }
    // The colour itself is Ark's --color, laid over the checkerboard.
    expect(prop(decls(`${SCOPE}[data-part="swatch"]::after`), "background")).toBe("var(--color)");
  });

  it("draws the popover from the popover slots with a 1px --border edge", () => {
    const content = decls(CONTENT);
    expect(prop(content, "background-color")).toBe("var(--popover)");
    expect(prop(content, "color")).toBe("var(--popover-foreground)");
    expect(prop(content, "border")).toBe("1px solid var(--border)");
    expect(prop(content, "box-shadow")).toBe("var(--shadow-md)");
  });

  it("leaves the positioner to floating-ui", () => {
    expect(all.filter(({ selector }) => selector.includes(`[data-part="positioner"]`))).toEqual([]);
  });

  it("dims a disabled picker once: its parts are reset", () => {
    expect(
      prop(decls(`${SCOPE}[data-part="root"][data-disabled] :where([data-part])`), "opacity"),
    ).toBe("1");
  });

  it("sizes the trigger from the recipe's data-size", () => {
    const trigger = (size: string) =>
      decls(
        `${SCOPE}[data-part="root"][data-size="${size}"] > [data-part="control"] > [data-part="trigger"]`,
      );
    expect(prop(trigger("sm"), "height")).toBe("var(--spacing-7)");
    expect(prop(trigger("lg"), "height")).toBe("calc(var(--spacing-8) + var(--spacing-2))");
  });
});
