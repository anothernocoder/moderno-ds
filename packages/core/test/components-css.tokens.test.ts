import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Cross-check: every custom property `components.css` paints from must be a slot
 * the token contract actually defines. This is what makes the "re-theme via
 * variables, without touching components" guarantee (F2.3) real — a brand
 * re-maps these same slots and every component follows. It also catches the
 * silent failure mode where a rule references an undefined token and quietly
 * falls back to a baked literal.
 */

const componentsCss = readFileSync(
  fileURLToPath(new URL("../src/styles/components.css", import.meta.url)),
  "utf8",
);
const tokensCss = readFileSync(
  fileURLToPath(new URL("../../tokens/src/tokens.css", import.meta.url)),
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
 * Custom properties set by Ark/floating-ui at runtime on the positioner — not
 * contract slots, and intentionally referenced with no fallback so they resolve
 * against the live element.
 */
const RUNTIME_VARS = new Set(["--reference-width"]);

describe("components.css references only contract token slots", () => {
  const defined = definedVars(tokensCss);
  const referenced = [...referencedVars(componentsCss)].filter((v) => !RUNTIME_VARS.has(v));

  it("the token contract is non-empty and components reference it", () => {
    expect(defined.size).toBeGreaterThan(10);
    expect(referenced.length).toBeGreaterThan(10);
  });

  it("every referenced slot is defined by @moderno/tokens", () => {
    const undefinedRefs = referenced.filter((v) => !defined.has(v));
    expect(undefinedRefs, `undefined token references: ${undefinedRefs.join(", ")}`).toEqual([]);
  });
});
