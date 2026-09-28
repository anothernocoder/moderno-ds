import { describe, expect, it } from "vitest";
import { parsePartial, prop, ruleDecls } from "./stylesheet.ts";

const toolbar = parsePartial("toolbar");
const button = parsePartial("button");

const ROOT = `[data-scope="toolbar"][data-part="root"]`;
const ITEMS = [
  `[data-scope="toolbar"][data-part="button"]`,
  `[data-scope="toolbar"][data-part="toggle"]`,
];
const sized = (size: string) =>
  `${ROOT}[data-size="${size}"] [data-scope="toolbar"]:is([data-part="button"], [data-part="toggle"])`;

describe("@moderno-ui/core components.css — Toolbar", () => {
  it("lines every item and any text readout up on one centre line", () => {
    const decls = ruleDecls(toolbar, ROOT);
    expect(prop(decls, "display")).toBe("inline-flex");
    expect(prop(decls, "align-items")).toBe("center");
    expect(prop(decls, "font-variant-numeric")).toBe("tabular-nums");
    expect(prop(ruleDecls(toolbar, `${ROOT}[data-orientation="vertical"]`), "flex-direction")).toBe(
      "column",
    );
  });

  for (const item of ITEMS) {
    it(`clears the UA button fill on ${item}`, () => {
      expect(prop(ruleDecls(toolbar, item), "background-color")).toBe("transparent");
    });

    it(`gives ${item} a hit area of at least --spacing-8 each way, at every size`, () => {
      const decls = ruleDecls(toolbar, `${item}::before`);
      expect(prop(decls, "position")).toBe("absolute");
      expect(prop(decls, "width")).toBe("max(100%, var(--spacing-8))");
      expect(prop(decls, "height")).toBe("max(100%, var(--spacing-8))");
      expect(prop(ruleDecls(toolbar, item), "position")).toBe("relative");
    });

    it(`draws ${item}'s focus ring inside it`, () => {
      const decls = ruleDecls(toolbar, `${item}:focus-visible`);
      expect(prop(decls, "outline")).toBe("2px solid var(--ring)");
      expect(prop(decls, "outline-offset")).toBe("-2px");
    });
  }

  it("sizes its items at Button's heights", () => {
    const buttonHeight = (size: string) =>
      prop(
        ruleDecls(button, `[data-scope="button"][data-part="root"][data-size="${size}"]`),
        "height",
      );
    expect(prop(ruleDecls(toolbar, sized("sm")), "height")).toBe(buttonHeight("sm"));
    expect(prop(ruleDecls(toolbar, ITEMS[0]!), "height")).toBe(buttonHeight("md"));
    expect(prop(ruleDecls(toolbar, sized("lg")), "height")).toBe(buttonHeight("lg"));
  });

  it("leaves room between neighbours for their hit areas", () => {
    // sm items are --spacing-7 tall and wide; their hit areas reach half of
    // (--spacing-8 − --spacing-7) past each side, which the --spacing-1 gap holds.
    expect(prop(ruleDecls(toolbar, ROOT), "gap")).toBe("var(--spacing-1)");
    expect(prop(ruleDecls(toolbar, sized("sm")), "min-width")).toBe("var(--spacing-7)");
  });

  it("presses a toggle with Toggle's accent pair", () => {
    const decls = ruleDecls(toolbar, `[data-scope="toolbar"][data-part="toggle"][data-state="on"]`);
    expect(prop(decls, "background-color")).toBe("var(--accent)");
    expect(prop(decls, "color")).toBe("var(--accent-foreground)");
  });

  it("draws the separator from --border, across the toolbar", () => {
    const separator = `[data-scope="toolbar"][data-part="separator"]`;
    expect(prop(ruleDecls(toolbar, separator), "background-color")).toBe("var(--border)");
    expect(prop(ruleDecls(toolbar, `${separator}[data-orientation="vertical"]`), "width")).toBe(
      "1px",
    );
    expect(prop(ruleDecls(toolbar, `${separator}[data-orientation="horizontal"]`), "height")).toBe(
      "1px",
    );
  });
});
