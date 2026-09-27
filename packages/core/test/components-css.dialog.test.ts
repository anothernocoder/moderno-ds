import { describe, expect, it } from "vitest";
import postcss, { type AtRule, type Declaration, type Root } from "postcss";
import { normalizeSelector, parsePartial, prop, ruleDecls } from "./stylesheet.ts";

const root = parsePartial("dialog");

const POSITIONER = `[data-scope="dialog"][data-part="positioner"]`;
const CONTENT = `[data-scope="dialog"][data-part="content"]`;

/** The partial's one viewport query: the small-screen presentation. */
function smallViewportQuery(): AtRule {
  const queries: AtRule[] = [];
  root.walkAtRules("media", (at) => {
    if (!at.params.includes("prefers-")) queries.push(at);
  });
  expect(queries).toHaveLength(1);
  return queries[0]!;
}

/** Declarations under `selector` inside `at` only. */
function declsIn(at: AtRule, selector: string): Declaration[] {
  const inner = postcss.root();
  inner.append(at.clone().nodes ?? []);
  return ruleDecls(inner as Root, selector);
}

/*
 * Dialog floats in the middle of the viewport, and on a small screen it
 * presents as a bottom Drawer with no code in the app (ADR-0005: a
 * shape change a viewport query is allowed for; see
 * components-css.media.test.ts for the allow-list).
 */
describe("@moderno-ui/core components.css — Dialog", () => {
  it("draws the surface with a 1px --border edge and one --shadow-* slot, no ring", () => {
    const content = ruleDecls(root, CONTENT);
    expect(prop(content, "border")).toBe("1px solid var(--border)");
    const shadows: string[] = [];
    root.walkDecls("box-shadow", (decl) => {
      shadows.push(decl.value);
    });
    expect(shadows).toEqual(["var(--shadow-lg)"]);
  });

  it("paints the backdrop from --overlay", () => {
    const backdrop = ruleDecls(root, `[data-scope="dialog"][data-part="backdrop"]`);
    expect(prop(backdrop, "background-color")).toBe("var(--overlay)");
  });

  it("switches under the small-viewport line, 40rem", () => {
    expect(smallViewportQuery().params).toBe("(width < 40rem)");
  });

  it("pins the content to the bottom edge on a small viewport", () => {
    const positioner = declsIn(smallViewportQuery(), POSITIONER);
    expect(prop(positioner, "align-items")).toBe("flex-end");
    expect(prop(positioner, "padding")).toBe("0");
  });

  it("shapes the content as a bottom Drawer: full width, top edge and top corners only", () => {
    const content = declsIn(smallViewportQuery(), CONTENT);
    expect(prop(content, "max-width")).toBe("none");
    expect(prop(content, "border-width")).toBe("1px 0 0");
    expect(prop(content, "border-radius")).toBe("var(--radius) var(--radius) 0 0");
    expect(prop(content, "overflow-y")).toBe("auto");
  });

  it("slides up and back down like a bottom Drawer, and not at all under less motion", () => {
    const query = smallViewportQuery();
    expect(prop(declsIn(query, `${CONTENT}[data-state="open"]`), "animation")).toMatch(
      /^moderno-drawer-in-bottom var\(--motion-/,
    );
    expect(prop(declsIn(query, `${CONTENT}[data-state="closed"]`), "animation")).toMatch(
      /^moderno-drawer-out-bottom var\(--motion-/,
    );
    const reduced: string[] = [];
    root.walkAtRules("media", (at) => {
      if (at.params !== "(prefers-reduced-motion: reduce)") return;
      at.walkRules((rule) => {
        if (normalizeSelector(rule.selector) === `${CONTENT}[data-state]`) {
          rule.walkDecls("animation", (decl) => {
            reduced.push(decl.value);
          });
        }
      });
    });
    expect(reduced).toEqual(["none"]);
  });
});
