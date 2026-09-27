import { describe, expect, it } from "vitest";
import type { AtRule } from "postcss";
import { normalizeSelector, parsePartial, prop, ruleDecls } from "./stylesheet.ts";

const root = parsePartial("carousel");

/*
 * Carousel's prev/next/autoplay triggers and its indicators are native
 * <button>s, so the browser defaults leak through unless the sheet overrides
 * them: the UA `buttonface` fill (a trigger paints --background, an indicator
 * has no fill and draws its dot as ::before), and a native `disabled` that Ark
 * sets on prev/next at either end, which must look the same as
 * `data-disabled` — also before Ark hydrates (3be5002).
 */
describe("@moderno-ui/core components.css — Carousel", () => {
  const SCOPE = `[data-scope="carousel"]`;
  const TRIGGERS = ["prev-trigger", "next-trigger", "autoplay-trigger"] as const;
  const BUTTONS = [...TRIGGERS, "indicator"] as const;
  const EVERY_TRIGGER = `${SCOPE}:is( ${TRIGGERS.map((p) => `[data-part="${p}"]`).join(", ")} )`;

  it("paints the triggers' own fill over the UA button fill", () => {
    expect(prop(ruleDecls(root, EVERY_TRIGGER), "background-color")).toBe("var(--background)");
  });

  it("clears the UA button fill on the indicator and draws its dot from contract slots", () => {
    expect(prop(ruleDecls(root, `${SCOPE}[data-part="indicator"]`), "background-color")).toBe(
      "transparent",
    );
    expect(
      prop(ruleDecls(root, `${SCOPE}[data-part="indicator"]::before`), "background-color"),
    ).toBe("var(--muted-foreground)");
    expect(
      prop(
        ruleDecls(root, `${SCOPE}[data-part="indicator"][data-current]::before`),
        "background-color",
      ),
    ).toBe("var(--primary)");
  });

  it.each(BUTTONS)("dims %s on :disabled as well as [data-disabled]", (part) => {
    for (const state of [":disabled", "[data-disabled]"]) {
      const decls = ruleDecls(root, `${SCOPE}[data-part="${part}"]${state}`);
      expect(prop(decls, "opacity"), state).toBe("0.5");
      expect(prop(decls, "pointer-events"), state).toBe("none");
    }
  });

  it("draws the focus ring inside every button", () => {
    const every = `${SCOPE}:is( ${BUTTONS.map((p) => `[data-part="${p}"]`).join(", ")} ):focus-visible`;
    const decls = ruleDecls(root, every);
    expect(prop(decls, "outline")).toBe("2px solid var(--ring)");
    expect(prop(decls, "outline-offset")).toBe("-2px");
  });

  it("rings the item group, a tab stop Ark adds, inside its edge", () => {
    const decls = ruleDecls(root, `${SCOPE}[data-part="item-group"]:focus-visible`);
    expect(prop(decls, "outline")).toBe("2px solid var(--ring)");
    expect(prop(decls, "outline-offset")).toBe("-2px");
  });

  it("sizes every control from spacing slots", () => {
    root.walkDecls(/^(width|height|min-width)$/, (decl) => {
      if (decl.value === "0") return; // min-width: 0 lets a grid or flex child shrink
      expect(decl.value, `${decl.parent?.toString().split("{")[0]} ${decl.prop}`).toMatch(
        /^(calc\()?var\(--spacing-\d\)/,
      );
    });
  });

  /*
   * A slide holds whatever the consumer puts in it, so the size rules, which
   * reach down from the root, must match only this carousel's own parts: not
   * another component's `indicator` or `prev-trigger` in a slide (Checkbox,
   * Toggle, Pagination use those names), and not the parts of a carousel
   * nested in a slide, which follow their own root's size. jsdom cannot match
   * a complex :not(), so the selector's shape is pinned here; Chromium was
   * checked by hand.
   */
  describe("size rules reach only the carousel's own parts", () => {
    const ROOT = `${SCOPE}[data-part="root"]`;
    const sizeSelectors: string[] = [];
    root.walkRules((rule) => {
      for (const selector of rule.selectors) {
        if (!selector.includes("[data-size=")) continue;
        sizeSelectors.push(
          normalizeSelector(selector).replace(/\(\s+/g, "(").replace(/\s+\)/g, ")"),
        );
      }
    });
    const sizeOf = (selector: string) => /\[data-size="(\w+)"\]/.exec(selector)![1]!;

    it("reads the size rules (guards the cases below from vacuous passes)", () => {
      expect(sizeSelectors).toHaveLength(8);
    });

    it.each(sizeSelectors)("matches a part of the carousel scope only: %s", (selector) => {
      expect(selector.startsWith(`${ROOT}[data-size="${sizeOf(selector)}"] ${SCOPE}`)).toBe(true);
    });

    it.each(sizeSelectors)("stops at a nested carousel of another size: %s", (selector) => {
      const size = sizeOf(selector);
      expect(selector).toContain(
        `:where(:not(${ROOT}[data-size="${size}"] ${ROOT}:not([data-size="${size}"]) *))`,
      );
    });
  });

  it("drops the controls' transitions under reduced motion", () => {
    const media: AtRule[] = [];
    root.walkAtRules("media", (rule) => {
      if (rule.params === "(prefers-reduced-motion: reduce)") media.push(rule);
    });
    expect(media).toHaveLength(1);
    const transitions: string[] = [];
    media[0]!.walkDecls("transition", (decl) => {
      transitions.push(decl.value);
    });
    expect(transitions).toEqual(["none"]);
    // Every rule outside the media query that animates is covered by it.
    const animated: string[] = [];
    root.walkDecls("transition", (decl) => {
      if (decl.parent?.parent?.type === "atrule") return;
      animated.push((decl.parent as { selector: string }).selector.replace(/\s+/g, " "));
    });
    const covered = (media[0]!.first as { selector: string }).selector.replace(/\s+/g, " ");
    for (const selector of animated) expect(covered).toContain(selector);
  });
});
