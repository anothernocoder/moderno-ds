import { describe, expect, it } from "vitest";
import type { Declaration, Rule } from "postcss";
import { parsePartial, prop } from "./stylesheet.ts";

const root = parsePartial("file-upload");

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
 * FileUpload is a drop zone and a list. The zone is a dashed box the whole
 * width of its container that turns solid --primary while a file is dragged
 * over it; each file is a bordered row. Only tokens: no literal colour,
 * radius, font or size beyond the 1px of a border and a hidden box.
 */
describe("@moderno-ui/core components.css — FileUpload", () => {
  const SCOPE = `[data-scope="file-upload"]`;
  const ZONE = `${SCOPE}[data-part="dropzone"]`;

  it("draws the zone as a dashed box the whole width of its container", () => {
    const zone = decls(ZONE);
    expect(prop(zone, "width")).toBe("100%");
    expect(prop(decls(`${SCOPE}[data-part="root"]`), "width")).toBe("100%");
    expect(prop(zone, "border")).toBe("1px dashed var(--input)");
    expect(prop(zone, "min-height")).toBe("calc(var(--spacing-8) * 4)");
  });

  it("changes the zone's look while a file is dragged over it", () => {
    const dragging = decls(`${ZONE}[data-dragging]`);
    expect(prop(dragging, "border-style")).toBe("solid");
    expect(prop(dragging, "border-color")).toBe("var(--primary)");
    expect(prop(dragging, "background-color")).toBe(
      "color-mix(in oklab, var(--primary) 8%, var(--background))",
    );
  });

  it("rings the zone inside its box, red when invalid", () => {
    const focus = decls(`${ZONE}:focus-visible`);
    expect(prop(focus, "outline")).toBe("2px solid var(--ring)");
    expect(prop(focus, "outline-offset")).toBe("-2px");
    expect(prop(decls(`${ZONE}[data-invalid]`), "border-color")).toBe("var(--destructive)");
    expect(prop(decls(`${ZONE}[data-invalid]:focus-visible`), "outline-color")).toBe(
      "var(--destructive)",
    );
  });

  it("edges a rejected file's row in --destructive and writes its reason in it", () => {
    expect(prop(decls(`${SCOPE}[data-part="item"][data-type="rejected"]`), "border-color")).toBe(
      "var(--destructive)",
    );
    expect(prop(decls(`${SCOPE}[data-part="item-error"]`), "color")).toBe("var(--destructive)");
  });

  it("truncates a long name in the middle, keeping the end whole", () => {
    const start = decls(`${SCOPE}[data-part="item-name-start"]`);
    expect(prop(start, "text-overflow")).toBe("ellipsis");
    expect(prop(start, "overflow")).toBe("hidden");
    expect(prop(decls(`${SCOPE}[data-part="item-name-end"]`), "flex")).toBe("none");
    expect(prop(decls(`${SCOPE}[data-part="item-name-full"]`), "clip-path")).toBe("inset(50%)");
  });

  it("gives the remove button a visible focus ring", () => {
    const focus = decls(`${SCOPE}[data-part="item-delete-trigger"]:focus-visible`);
    expect(prop(focus, "outline")).toBe("2px solid var(--ring)");
  });

  it("dims a disabled upload once: its parts are reset", () => {
    expect(
      prop(decls(`${SCOPE}[data-part="root"][data-disabled] :where([data-part])`), "opacity"),
    ).toBe("1");
  });

  it("sizes the zone from the recipe's data-size", () => {
    const zone = (size: string) =>
      decls(`${SCOPE}[data-part="root"][data-size="${size}"] > [data-part="dropzone"]`);
    expect(prop(zone("sm"), "min-height")).toBe("calc(var(--spacing-8) * 3)");
    expect(prop(zone("lg"), "min-height")).toBe("calc(var(--spacing-8) * 5)");
  });

  it("uses no literal colour, radius, font or type size", () => {
    root.walkDecls((decl) => {
      if (/color|background|border-radius|font-family|font-size|line-height/.test(decl.prop)) {
        expect(decl.value, `${decl.prop}: ${decl.value}`).not.toMatch(
          /#[0-9a-f]{3,8}\b|rgb|hsl|\dpx|\drem/i,
        );
      }
    });
  });
});
