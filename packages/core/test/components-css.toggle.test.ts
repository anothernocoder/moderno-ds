import { describe, expect, it } from "vitest";
import type { Rule } from "postcss";
import { normalizeSelector, parsePartial, prop, ruleDecls } from "./stylesheet.ts";

/** Toggle and ToggleGroup share their button rules, so they share one partial. */
const root = parsePartial("toggle");

/*
 * Toggle's root and ToggleGroup's items are native <button>s too, so the same
 * two browser defaults leak through: the UA `buttonface` fill (a toggle at
 * rest has no fill of its own) and a native `disabled` set without Ark — or
 * before it hydrates — which carries no `data-disabled` for the base layer.
 */
describe("@moderno-ui/core components.css — Toggle and ToggleGroup buttons override the native defaults", () => {
  for (const button of [
    `[data-scope="toggle"][data-part="root"]`,
    `[data-scope="toggle-group"][data-part="item"]`,
  ]) {
    it(`clears the UA button fill on ${button}`, () => {
      expect(prop(ruleDecls(root, button), "background-color")).toBe("transparent");
    });

    it(`dims and disables a native :disabled ${button} like [data-disabled]`, () => {
      const decls = ruleDecls(root, `${button}:disabled`);
      expect(prop(decls, "opacity")).toBe("0.5");
      expect(prop(decls, "pointer-events")).toBe("none");
    });
  }

  const selectorsInOrder: string[] = [];
  root.walkRules((r: Rule) => {
    selectorsInOrder.push(...r.selectors.map(normalizeSelector));
  });

  for (const { name, rootSelector, disabledSelector } of [
    {
      name: "Toggle",
      rootSelector: `[data-scope="toggle"][data-part="root"]`,
      disabledSelector: `[data-scope="toggle"][data-part="root"]:disabled`,
    },
    {
      name: "ToggleGroup",
      rootSelector: `[data-scope="toggle-group"][data-part="root"]`,
      disabledSelector: `[data-scope="toggle-group"][data-part="item"]:disabled`,
    },
  ]) {
    it(`dims a disabled ${name} once: its parts are reset after the :disabled rule`, () => {
      const reset = `${rootSelector}[data-disabled] :where([data-part])`;
      expect(prop(ruleDecls(root, reset), "opacity")).toBe("1");
      expect(selectorsInOrder.indexOf(reset)).toBeGreaterThan(
        selectorsInOrder.indexOf(disabledSelector),
      );
    });
  }
});
