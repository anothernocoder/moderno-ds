import { describe, expect, it } from "vitest";
import type { AtRule } from "postcss";
import { parsePartial, prop, ruleDecls } from "./stylesheet.ts";

const root = parsePartial("sortable-list");

const SCOPE = `[data-scope="sortable-list"]`;
const ROOT = `${SCOPE}[data-part="root"]`;
const ITEM = `${SCOPE}[data-part="item"]`;
const HANDLE = `${SCOPE}[data-part="item-handle"]`;

/*
 * The machine draws a moving item and the items it passes with
 * --sortable-list-offset; the stylesheet turns that into a glide, except
 * where the item must follow the pointer or land without a jump.
 */
describe("@moderno-ui/core components.css — SortableList", () => {
  it("draws each item at the offset the machine sets, gliding there", () => {
    const decls = ruleDecls(root, ITEM);
    expect(prop(decls, "transform")).toBe("translateY(var(--sortable-list-offset))");
    expect(prop(decls, "transition")).toMatch(/^transform var\(--motion-fast\)/);
  });

  it("lets a pointer carry its item with no glide", () => {
    expect(prop(ruleDecls(root, `${ITEM}[data-dragging="pointer"]`), "transition")).toBe("none");
  });

  it("glides nothing for the frames right after a drop, when the order changes", () => {
    const decls = ruleDecls(root, `${ROOT}[data-settling] > [data-part="item"]`);
    expect(prop(decls, "transition")).toBe("none");
  });

  it("glides nothing when the user asks for reduced motion", () => {
    let reduced: string | undefined;
    root.walkAtRules("media", (media: AtRule) => {
      if (!media.params.includes("prefers-reduced-motion: reduce")) return;
      media.walkRules((rule) => {
        if (rule.selector === ITEM) {
          rule.walkDecls("transition", (decl) => {
            reduced = decl.value;
          });
        }
      });
    });
    expect(reduced).toBe("none");
  });

  it("lets a touch on what drags move the item instead of scrolling the page", () => {
    expect(prop(ruleDecls(root, HANDLE), "touch-action")).toBe("none");
    const noHandle = `${ITEM}:not(:has([data-part="item-handle"]))`;
    expect(prop(ruleDecls(root, noHandle), "touch-action")).toBe("none");
  });

  it("keeps a disabled list or item usable: only the handle is dimmed", () => {
    for (const selector of [`${ROOT}[data-disabled]`, `${ITEM}[data-disabled]`]) {
      const decls = ruleDecls(root, selector);
      expect(prop(decls, "opacity"), selector).toBe("1");
      expect(prop(decls, "pointer-events"), selector).toBe("auto");
    }
  });
});
