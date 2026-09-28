import { describe, expect, it } from "vitest";
import type { Rule } from "postcss";
import { parsePartial, prop, ruleDecls } from "./stylesheet.ts";

const root = parsePartial("editable");

/*
 * Editable swaps its text for an input in the same place. The two must be
 * one box — the same height, padding, border width and type at every size —
 * or the row jumps when an edit starts.
 */
describe("@moderno-ui/core components.css — Editable", () => {
  const SCOPE = `[data-scope="editable"]`;
  const ROOT = `${SCOPE}[data-part="root"]`;
  const PREVIEW = `${SCOPE}[data-part="preview"]`;
  const INPUT = `${SCOPE}[data-part="input"]`;
  const rules = () => {
    const found: Rule[] = [];
    root.walkRules((r: Rule) => {
      found.push(r);
    });
    return found;
  };

  /** The declarations every rule whose selector list holds `selector` gives it. */
  const declsOf = (selector: string) => {
    const decls: Record<string, string> = {};
    for (const rule of rules()) {
      if (!rule.selectors.map((s) => s.replace(/\s+/g, " ")).includes(selector)) continue;
      rule.walkDecls((d) => {
        decls[d.prop] = d.value;
      });
    }
    return decls;
  };

  it("draws the text and the input as one box: same height, padding, border and type", () => {
    for (const size of ["sm", "md", "lg"]) {
      const preview = `${ROOT}[data-size="${size}"] > [data-part="area"] > [data-part="preview"]`;
      const input = `${ROOT}[data-size="${size}"] > [data-part="area"] > [data-part="input"]`;
      const text = declsOf(preview);
      const field = declsOf(input);
      for (const name of ["height", "font-size"]) {
        expect(text[name], `${size} ${name}`).toBeDefined();
        expect(text[name], `${size} ${name}`).toBe(field[name]);
      }
      expect(text["padding"] ?? text["padding-inline"], size).toBe(
        field["padding"] ?? field["padding-inline"],
      );
    }
    expect(declsOf(PREVIEW)["border"]).toBe(declsOf(INPUT)["border"]);
  });

  it("matches the Field sizes", () => {
    expect(
      declsOf(`${ROOT}[data-size="md"] > [data-part="area"] > [data-part="preview"]`).height,
    ).toBe("var(--spacing-8)");
    expect(
      declsOf(`${ROOT}[data-size="sm"] > [data-part="area"] > [data-part="preview"]`).height,
    ).toBe("var(--spacing-7)");
    expect(
      declsOf(`${ROOT}[data-size="lg"] > [data-part="area"] > [data-part="preview"]`).height,
    ).toBe("calc(var(--spacing-8) + var(--spacing-2))");
  });

  it("keys every size on the root, md included, so a Field around it cannot resize one part", () => {
    for (const selector of [PREVIEW, INPUT, `${SCOPE}[data-part="label"]`]) {
      for (const name of ["height", "font-size", "padding-inline", "line-height"]) {
        expect(declsOf(selector)[name], `${selector} ${name}`).toBeUndefined();
      }
    }
  });

  it("keeps the room of a hidden button, so the text keeps its width when an edit starts", () => {
    const CONTROL = `${SCOPE}[data-part="control"]`;
    const hidden = declsOf(`${CONTROL} > [data-part][hidden]`);
    expect(hidden["visibility"]).toBe("hidden");
    expect(hidden["display"]).toBe("inline-flex");
    // The edit button takes the place of the save and cancel buttons.
    expect(declsOf(`${CONTROL} > [data-part="edit-trigger"]`)["grid-row"]).toBe("1");
    expect(declsOf(`${CONTROL} > [data-part="submit-trigger"]`)["grid-row"]).toBe("1");
    expect(declsOf(`${CONTROL} > [data-part="cancel-trigger"]`)["grid-row"]).toBe("1");
  });

  it("cuts a long text with an ellipsis on one line", () => {
    const decls = ruleDecls(root, PREVIEW);
    expect(prop(decls, "text-overflow")).toBe("ellipsis");
    expect(prop(decls, "white-space")).toBe("nowrap");
    expect(prop(decls, "overflow")).toBe("hidden");
  });

  it("hints on hover that the text can be edited, unless it cannot be", () => {
    const hover = rules().find((r) => r.selector.startsWith(`${PREVIEW}:hover:not(`));
    expect(hover, "preview hover rule").toBeDefined();
    expect(hover!.selector).toContain("[data-disabled]");
    expect(hover!.selector).toContain('[aria-readonly="true"]');
    let border: string | undefined;
    hover!.walkDecls("border-color", (d) => {
      border = d.value;
    });
    expect(border).toBe("var(--input)");
  });

  it("rings the focused text and input inside their box", () => {
    const decls = declsOf(`${PREVIEW}:focus-visible`);
    expect(decls["outline"]).toBe("2px solid var(--ring)");
    expect(decls["outline-offset"]).toBe("-2px");
    expect(declsOf(`${INPUT}:focus-visible`)["outline"]).toBe("2px solid var(--ring)");
  });

  it("dims a disabled editable once: the parts in its area are reset", () => {
    expect(
      prop(
        ruleDecls(root, `${SCOPE}[data-part="area"][data-disabled] :where([data-part])`),
        "opacity",
      ),
    ).toBe("1");
  });

  it("never sets display on a part a size rule reaches, so Ark's `hidden` holds", () => {
    for (const rule of rules()) {
      if (!rule.selector.includes("[data-size=")) continue;
      rule.walkDecls((d) => {
        expect(d.prop, rule.selector).not.toBe("display");
      });
    }
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
