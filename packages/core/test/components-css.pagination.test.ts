import { describe, expect, it } from "vitest";
import type { Rule } from "postcss";
import { parsePartial, prop, ruleDecls } from "./stylesheet.ts";

const root = parsePartial("pagination");

/*
 * Pagination's page items and its four triggers are native <button>s, so the
 * browser defaults leak through unless the sheet overrides them: the UA
 * `buttonface` fill (a page button has no fill at rest), and a native
 * `disabled` that Ark sets on a trigger with nowhere to go, which must look
 * the same as `data-disabled` — also before Ark hydrates (3be5002).
 */
describe("@moderno-ui/core components.css — Pagination", () => {
  const SCOPE = `[data-scope="pagination"]`;
  const BUTTONS = [
    "item",
    "first-trigger",
    "prev-trigger",
    "next-trigger",
    "last-trigger",
  ] as const;
  const EVERY_BUTTON = `${SCOPE}:is( ${BUTTONS.map((p) => `[data-part="${p}"]`).join(", ")} )`;

  it("clears the UA button fill on every button part", () => {
    expect(prop(ruleDecls(root, EVERY_BUTTON), "background-color")).toBe("transparent");
  });

  it.each(BUTTONS)("dims %s on :disabled as well as [data-disabled]", (part) => {
    for (const state of [":disabled", "[data-disabled]"]) {
      const decls = ruleDecls(root, `${SCOPE}[data-part="${part}"]${state}`);
      expect(prop(decls, "opacity"), state).toBe("0.5");
      expect(prop(decls, "pointer-events"), state).toBe("none");
    }
  });

  it("outlines the current page from contract slots", () => {
    const current = ruleDecls(root, `${SCOPE}[data-part="item"][data-selected]`);
    expect(prop(current, "border-color")).toBe("var(--border)");
    expect(prop(current, "background-color")).toBe("var(--background)");
  });

  it("draws the focus ring inside every button", () => {
    const decls = ruleDecls(root, `${EVERY_BUTTON}:focus-visible`);
    expect(prop(decls, "outline")).toBe("2px solid var(--ring)");
    expect(prop(decls, "outline-offset")).toBe("-2px");
  });

  it("sizes the buttons and the ellipsis from spacing slots at every size", () => {
    const heights: string[] = [];
    root.walkRules((r: Rule) => {
      if (!r.selector.startsWith(SCOPE)) return;
      r.walkDecls("height", (d) => {
        heights.push(d.value);
      });
    });
    expect(heights).toHaveLength(4);
    for (const h of heights) expect(h).toMatch(/^(calc\()?var\(--spacing-\d\)/);
  });
});
