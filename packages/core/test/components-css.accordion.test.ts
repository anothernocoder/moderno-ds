import { describe, expect, it } from "vitest";
import { normalizeSelector, parsePartial, prop, ruleDecls } from "./stylesheet.ts";

const root = parsePartial("accordion");

/*
 * An Accordion trigger is a native <button>, so the same two browser defaults
 * leak through: the UA `buttonface` fill (a trigger has no fill of its own)
 * and a native `disabled` set without Ark, or before it hydrates, which
 * carries no `data-disabled`. Ark stamps `data-disabled` on the item and on
 * its content and indicator too, so the item is dimmed once and its parts
 * reset. The content's height animates from the height Ark measures.
 */
describe("@moderno-ui/core components.css — Accordion", () => {
  const TRIGGER = `[data-scope="accordion"][data-part="item-trigger"]`;
  const CONTENT = `[data-scope="accordion"][data-part="item-content"]`;
  const selectorsInOrder: string[] = [];
  root.walkRules((r) => {
    selectorsInOrder.push(...r.selectors.map(normalizeSelector));
  });

  it("clears the UA button fill on the trigger", () => {
    expect(prop(ruleDecls(root, TRIGGER), "background-color")).toBe("transparent");
  });

  it("dims and disables a native :disabled trigger like [data-disabled]", () => {
    const decls = ruleDecls(root, `${TRIGGER}:disabled`);
    expect(prop(decls, "opacity")).toBe("0.5");
    expect(prop(decls, "pointer-events")).toBe("none");
  });

  it("dims a disabled item once: its parts are reset after the :disabled rule", () => {
    const reset = `[data-scope="accordion"][data-part="item"][data-disabled] :where([data-part])`;
    expect(prop(ruleDecls(root, reset), "opacity")).toBe("1");
    expect(selectorsInOrder.indexOf(reset)).toBeGreaterThan(
      selectorsInOrder.indexOf(`${TRIGGER}:disabled`),
    );
  });

  it("animates the content's height from the height Ark measures, both ways", () => {
    expect(prop(ruleDecls(root, CONTENT), "overflow")).toBe("hidden");
    expect(prop(ruleDecls(root, `${CONTENT}[data-state="open"]`), "animation")).toMatch(
      /^moderno-accordion-expand var\(--motion-normal\)/,
    );
    expect(prop(ruleDecls(root, `${CONTENT}[data-state="closed"]`), "animation")).toMatch(
      /^moderno-accordion-collapse var\(--motion-normal\)/,
    );
    const keyframes: Record<string, string[]> = {};
    root.walkAtRules("keyframes", (at) => {
      if (!at.params.startsWith("moderno-accordion-")) return;
      keyframes[at.params] = [];
      at.walkDecls("height", (d) => {
        keyframes[at.params]!.push(d.value);
      });
    });
    expect(keyframes).toEqual({
      "moderno-accordion-expand": ["0", "var(--height)"],
      "moderno-accordion-collapse": ["var(--height)", "0"],
    });
  });

  it("drops the animation under reduced motion", () => {
    let dropped = false;
    root.walkAtRules("media", (at) => {
      if (!at.params.includes("prefers-reduced-motion")) return;
      at.walkRules((r) => {
        if (r.selector === `${CONTENT}[data-state]`) {
          r.walkDecls("animation", (d) => {
            dropped = d.value === "none";
          });
        }
      });
    });
    expect(dropped).toBe(true);
  });

  it("reaches the items and their parts through child combinators, so a nested Accordion keeps its own look", () => {
    const variantRules = selectorsInOrder.filter((s) =>
      /\[data-scope="accordion"\]\[data-part="root"\](\[data-(variant|size)=[^\]]+\])+ /.test(s),
    );
    expect(variantRules.length).toBeGreaterThan(0);
    for (const s of variantRules) {
      expect(s, s).not.toMatch(/\] \[data-part/);
    }
  });
});
