import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import postcss from "postcss";
import { partialNames, readComponentsCss, readPartial } from "./stylesheet.ts";

/**
 * Cross-check: every custom property `components.css` paints from must be a slot
 * the token contract actually defines. This is what makes the "re-theme via
 * variables, without touching components" guarantee (F2.3) real — a brand
 * re-maps these same slots and every component follows. It also catches the
 * silent failure mode where a rule references an undefined token and quietly
 * falls back to a baked literal.
 */

const componentsCss = readComponentsCss();
const tokensCss = readFileSync(
  fileURLToPath(new URL("../../css/src/tokens.css", import.meta.url)),
  "utf8",
);

/** Names the contract declares: `--foo:` on the left of a declaration. */
function definedVars(css: string): Set<string> {
  const out = new Set<string>();
  for (const m of css.matchAll(/(--[a-z0-9-]+)\s*:/gi)) out.add(m[1]!);
  return out;
}

/** Names referenced via `var(--foo)` / `var(--foo, fallback)`. */
function referencedVars(css: string): Set<string> {
  const out = new Set<string>();
  for (const m of css.matchAll(/var\(\s*(--[a-z0-9-]+)/gi)) out.add(m[1]!);
  return out;
}

/**
 * Custom properties a partial declares as set at runtime, with a
 * `/* @runtime-vars --width --height — why *\/` comment: Ark and floating-ui
 * set them on the live element (the Select positioner's --reference-width,
 * the Tabs indicator's box, the Accordion content's height, the Progress
 * circle range's --circumference). They are not contract slots, and are
 * referenced with no fallback so they resolve against that element. Each
 * scope declares its own, so a new scope edits no shared list.
 */
function runtimeVarsDeclaredIn(css: string): Set<string> {
  const out = new Set<string>();
  postcss.parse(css).walkComments((comment) => {
    if (!comment.text.startsWith("@runtime-vars")) return;
    for (const m of comment.text.matchAll(/--[a-z0-9-]+/gi)) out.add(m[0]);
  });
  return out;
}

const defined = definedVars(tokensCss);
const partials = partialNames();

describe("components.css references only contract token slots", () => {
  const runtime = new Set(
    partials.flatMap((name) => [...runtimeVarsDeclaredIn(readPartial(name))]),
  );
  const referenced = [...referencedVars(componentsCss)].filter((v) => !runtime.has(v));

  it("the token contract is non-empty and components reference it", () => {
    expect(defined.size).toBeGreaterThan(10);
    expect(referenced.length).toBeGreaterThan(10);
  });

  it("every referenced slot is defined by @moderno-ui/css", () => {
    const undefinedRefs = referenced.filter((v) => !defined.has(v));
    expect(undefinedRefs, `undefined token references: ${undefinedRefs.join(", ")}`).toEqual([]);
  });
});

describe("each partial references only contract slots and the runtime variables it declares", () => {
  it("reads the partials (guards the cases below from vacuous passes)", () => {
    expect(partials).toContain("_base");
    expect(partials.length).toBeGreaterThan(10);
  });

  it.each(partials)("%s.css", (name) => {
    const css = readPartial(name);
    const runtime = runtimeVarsDeclaredIn(css);
    const referenced = referencedVars(css);

    const undefinedRefs = [...referenced].filter((v) => !defined.has(v) && !runtime.has(v));
    expect(undefinedRefs, `undefined token references: ${undefinedRefs.join(", ")}`).toEqual([]);

    // A declaration may not hide a contract slot or outlive the rule that needed it.
    for (const variable of runtime) {
      expect(defined.has(variable), `${variable} is a contract slot, not a runtime variable`).toBe(
        false,
      );
      expect(referenced.has(variable), `${variable} is declared but never referenced`).toBe(true);
    }
  });
});
