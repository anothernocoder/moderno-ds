/**
 * `moderno/no-reimplemented-primitive` (validate-rules.md #5) — heuristic,
 * `warn` not `error`: a hand-rolled control that a Moderno primitive already
 * provides. Per the doc's own compound signals, not just bare-tag presence
 * (a plain `<button>` or `<select>` is ordinary HTML most of the time):
 *
 * - Dialog: a native `<dialog>` tag, or `role="dialog"` on any element.
 * - Select: a native `<select>` tag (a standalone, low-noise signal — there's
 *   rarely a legitimate reason to reach for it once Select exists).
 * - Button: a native `<button>` whose `class`/`className` looks like manual
 *   variant switching (the doc's "bare `<button>` with manual variant
 *   classes"), not every native button — most are unrelated, ordinary HTML.
 *
 * Not detected (would need real behavioral analysis, not a static snippet
 * check): the doc's "focus-trap code" qualifier on Dialog, or "a listbox
 * built from scratch" for Select.
 */
import type { Finding, Rule } from "./types.ts";
import { findComponentUsages } from "./component-usages.ts";
import { offsetToLoc } from "./text.ts";

const VARIANT_CLASS_SIGNAL =
  /\b(variant|btn-|button-|primary|secondary|outline|ghost|destructive)\b/i;
const NATIVE_TAG_SCOPES = new Set(["button", "dialog", "select"]);

/** The offset of the `<` that opens the tag containing `index` (an attribute match), or null if `index` isn't inside a tag. */
function enclosingTagStart(code: string, index: number): number | null {
  const open = code.lastIndexOf("<", index);
  if (open === -1) return null;
  const closedBefore = code.indexOf(">", open);
  if (closedBefore !== -1 && closedBefore < index) return null;
  return open;
}

/** Offsets of the opening `<` of every element that reimplements `scope`, deduped. */
function findSignals(code: string, scope: string): number[] {
  const positions = new Set<number>();

  if (scope === "button") {
    for (const usage of findComponentUsages(code, "button")) {
      const classValue = usage.attrs.className ?? usage.attrs.class;
      if (typeof classValue === "string" && VARIANT_CLASS_SIGNAL.test(classValue)) {
        positions.add(usage.start);
      }
    }
    return [...positions];
  }

  const nativeTag = new RegExp(`<${scope}(?=[\\s/>])`, "g");
  for (const match of code.matchAll(nativeTag)) positions.add(match.index);

  if (scope === "dialog") {
    for (const match of code.matchAll(/role=["']dialog["']/g)) {
      const start = enclosingTagStart(code, match.index);
      if (start !== null) positions.add(start);
    }
  }

  return [...positions];
}

export const noReimplementedPrimitive: Rule = {
  id: "moderno/no-reimplemented-primitive",
  severity: "warn",
  frameworks: "all",
  check(ctx): Finding[] {
    const manifest = ctx.manifests.components.find((m) => m.framework === ctx.framework);
    if (!manifest) return [];

    const findings: Finding[] = [];
    for (const component of manifest.components) {
      if (!NATIVE_TAG_SCOPES.has(component.scope)) continue;
      const signals = findSignals(ctx.code, component.scope).sort((a, b) => a - b);
      for (const start of signals) {
        findings.push({
          ruleId: "moderno/no-reimplemented-primitive",
          severity: "warn",
          loc: offsetToLoc(ctx.code, start),
          message: `Hand-rolled <${component.scope}> looks like a reimplementation of Moderno's ${component.name}.${
            component.guidance?.intent ? ` (${component.guidance.intent})` : ""
          }`,
          suggestion: component.import,
        });
      }
    }
    return findings;
  },
};
