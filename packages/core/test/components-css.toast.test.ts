import { describe, expect, it } from "vitest";
import type { AtRule, Declaration, Rule } from "postcss";
import { parsePartial, prop, ruleDecls } from "./stylesheet.ts";

const root = parsePartial("toast");
const SCOPE = `[data-scope="toast"]`;
const ROOT = `${SCOPE}[data-part="root"]`;

/** Every declaration in the partial, with the selector it sits under. */
const decls: { selector: string; decl: Declaration }[] = [];
root.walkRules((rule: Rule) => {
  rule.walkDecls((decl) => {
    decls.push({ selector: rule.selector, decl });
  });
});

/*
 * A toast floats over the page, so its contract is the elevation one: the
 * popover fill, a 1px --border edge and a soft --shadow-* drop — never a ring
 * stacked into box-shadow, which doubled the border into a 2px edge (47d89e2).
 * Ark pins the group and lays each toast out inline; the partial reads the
 * variables Ark sets rather than placing anything itself.
 */
describe("@moderno-ui/core components.css — Toast", () => {
  it("draws the surface from the popover slots with a 1px --border edge", () => {
    const surface = ruleDecls(root, ROOT);
    expect(prop(surface, "background-color")).toBe("var(--popover)");
    expect(prop(surface, "color")).toBe("var(--popover-foreground)");
    expect(prop(surface, "border")).toBe("1px solid var(--border)");
    expect(prop(surface, "border-radius")).toBe("var(--radius)");
  });

  it("lifts it with one --shadow-* slot as it is, never a ring in box-shadow", () => {
    const shadows = decls.filter(({ decl }) => decl.prop === "box-shadow");
    expect(shadows.map(({ decl }) => decl.value)).toEqual(["var(--shadow-lg)"]);
  });

  it("moves each toast by the variables Ark sets on it", () => {
    const surface = ruleDecls(root, ROOT);
    expect(prop(surface, "translate")).toBe("var(--x) var(--y)");
    expect(prop(surface, "scale")).toBe("var(--scale)");
    expect(prop(surface, "opacity")).toBe("var(--opacity)");
    expect(prop(surface, "height")).toBe("var(--height)");
    expect(prop(surface, "z-index")).toBe("var(--z-index)");
  });

  it("never sets the position Ark gives the group and each toast inline", () => {
    const placed = decls.filter(
      ({ selector, decl }) =>
        decl.prop === "position" && (selector.includes(`[data-part="group"]`) || selector === ROOT),
    );
    expect(placed).toEqual([]);
  });

  it("gives a corner group the toaster's own inset on its free edge", () => {
    const group = ruleDecls(root, `${SCOPE}[data-part="group"]`);
    expect(prop(group, "inset-inline-start")).toBe("var(--viewport-offset-left)");
    expect(prop(group, "inset-inline-end")).toBe("var(--viewport-offset-right)");
  });

  it("fills that room up to a container slot", () => {
    const surface = ruleDecls(root, ROOT);
    expect(prop(surface, "width")).toBe("100%");
    expect(prop(surface, "max-width")).toBe("var(--container-sm)");
  });

  it("times every transition by a motion slot", () => {
    const transitions = decls.filter(({ decl }) => decl.prop === "transition");
    expect(transitions.length).toBeGreaterThan(0);
    for (const { selector, decl } of transitions) {
      if (decl.value === "none") continue;
      for (const part of decl.value.split(",")) {
        expect(part.trim(), `${selector} { transition }`).toMatch(
          /^[a-z-]+ var\(--motion-(instant|fast|normal)\)( ease-(in|out))?$/,
        );
      }
    }
  });

  it("steps padding, gap and type per size, from the contract slots", () => {
    const base = ruleDecls(root, ROOT);
    const sizes = {
      sm: ruleDecls(root, `${ROOT}[data-size="sm"]`),
      lg: ruleDecls(root, `${ROOT}[data-size="lg"]`),
    };
    expect(prop(base, "padding")).toBe("var(--spacing-4)");
    expect(prop(sizes.sm, "padding")).toBe("var(--spacing-3)");
    expect(prop(sizes.lg, "padding")).toBe("var(--spacing-5)");
    expect(prop(base, "font-size")).toBe("var(--text-ui-md)");
    expect(prop(sizes.sm, "font-size")).toBe("var(--text-ui-sm)");
    expect(prop(sizes.lg, "font-size")).toBe("var(--text-ui-lg)");
    expect(prop(base, "line-height")).toBe("var(--leading-ui-md)");
    expect(prop(sizes.sm, "line-height")).toBe("var(--leading-ui-sm)");
    expect(prop(sizes.lg, "line-height")).toBe("var(--leading-ui-lg)");
  });

  it("takes every length, type size and weight from a slot (or zero)", () => {
    const LENGTH =
      /^(padding.*|margin.*|gap|width|max-width|height|inset-.*|font-size|line-height|font-weight)$/;
    let checked = 0;
    for (const { selector, decl } of decls) {
      if (!LENGTH.test(decl.prop)) continue;
      checked++;
      // `inherit` only on the title and description, which take the root's
      // type; `100%` is the room the group gives; the rest are Ark's variables.
      expect(decl.value, `${selector} { ${decl.prop} }`).toMatch(
        /^(0|inherit|100%|var\(--(spacing-\d|container-sm|text-ui-(sm|md|lg)|leading-ui-(sm|md|lg)|font-weight-[a-z]+|height|viewport-offset-(left|right))\))$/,
      );
    }
    expect(checked).toBeGreaterThan(20);
  });

  it("tints each status from its own contract slot, error from --destructive", () => {
    const slots = { success: "success", warning: "warning", error: "destructive" };
    for (const [type, slot] of Object.entries(slots)) {
      const tint = ruleDecls(root, `${ROOT}[data-type="${type}"]`);
      expect(prop(tint, "background-color"), type).toBe(
        `color-mix(in oklab, var(--${slot}) 8%, var(--popover))`,
      );
      expect(prop(tint, "border-color"), type).toBe(
        `color-mix(in oklab, var(--${slot}) 28%, var(--border))`,
      );
    }
  });

  it("keeps a plain toast neutral: Ark types one `info`, and `loading` is no alarm", () => {
    expect(ruleDecls(root, `${ROOT}[data-type="info"]`)).toEqual([]);
    expect(ruleDecls(root, `${ROOT}[data-type="loading"]`)).toEqual([]);
  });

  it("resets the title's and description's own heading and paragraph look", () => {
    for (const part of ["title", "description"]) {
      const partDecls = ruleDecls(root, `${SCOPE}[data-part="${part}"]`);
      expect(prop(partDecls, "margin"), part).toBe("0");
      expect(prop(partDecls, "font-size"), part).toBe("inherit");
    }
  });

  it("names no viewport in a media query: only the reduced-motion preference", () => {
    const queries: string[] = [];
    root.walkAtRules("media", (rule: AtRule) => {
      queries.push(rule.params);
    });
    expect(queries).toEqual(["(prefers-reduced-motion: reduce)"]);
  });
});

/*
 * The action and close triggers are native <button>s, so the browser's
 * defaults leak through unless the sheet overrides them: the UA `buttonface`
 * fill (neither paints one of its own), and a native `disabled` that must
 * look the same as `data-disabled` (3be5002).
 */
describe("@moderno-ui/core components.css — Toast's buttons", () => {
  const BUTTONS = ["action-trigger", "close-trigger"] as const;
  const EVERY_BUTTON = `${SCOPE}:is(${BUTTONS.map((p) => `[data-part="${p}"]`).join(", ")})`;

  it.each(BUTTONS)("clears the UA button fill on the %s", (part) => {
    expect(prop(ruleDecls(root, `${SCOPE}[data-part="${part}"]`), "background-color")).toBe(
      "transparent",
    );
  });

  it.each([":disabled", "[data-disabled]"])("dims both buttons on %s", (state) => {
    const stateDecls = ruleDecls(root, `${EVERY_BUTTON}${state}`);
    expect(prop(stateDecls, "opacity")).toBe("0.5");
    expect(prop(stateDecls, "pointer-events")).toBe("none");
  });

  it("draws the focus ring inside both buttons", () => {
    const focus = ruleDecls(root, `${EVERY_BUTTON}:focus-visible`);
    expect(prop(focus, "outline")).toBe("2px solid var(--ring)");
    expect(prop(focus, "outline-offset")).toBe("-2px");
  });
});
