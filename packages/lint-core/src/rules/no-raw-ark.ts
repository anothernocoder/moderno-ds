/**
 * `moderno/no-raw-ark` (validate-rules.md #4) — importing straight from
 * `@ark-ui/*`/`@zag-js/*` skips the shared stylesheet + recipe a `@moderno-ui/*`
 * wrapper provides, producing off-contract, un-themed UI.
 */
import type { Finding, Rule } from "./types.ts";
import { offsetToLoc } from "./text.ts";

const ARK_IMPORT = /import\s+([^;]*?)\s+from\s+["'](@ark-ui\/[\w./-]*|@zag-js\/[\w./-]*)["']/g;

/** Named/default identifiers bound by an `import <clause> from "..."` clause. */
function importedIdentifiers(clause: string): string[] {
  const named = /\{([^}]*)\}/.exec(clause)?.[1];
  if (named) {
    return named
      .split(",")
      .map((s) =>
        s
          .trim()
          .split(/\s+as\s+/)[0]!
          .trim(),
      )
      .filter(Boolean);
  }
  if (/^\*\s+as\s+/.test(clause)) return [];
  return [clause.trim()].filter(Boolean);
}

/** `SegmentGroup` → `segment-group`: an Ark component's name spelled as its `data-scope`. */
function scopeOf(identifier: string): string {
  return identifier.replace(/(?<=[a-z0-9])([A-Z])/g, "-$1").toLowerCase();
}

export const noRawArk: Rule = {
  id: "moderno/no-raw-ark",
  severity: "error",
  frameworks: "all",
  fixable: true,
  check(ctx): Finding[] {
    const manifest = ctx.manifests.components.find((m) => m.framework === ctx.framework);
    const findings: Finding[] = [];

    for (const match of ctx.code.matchAll(ARK_IMPORT)) {
      const [, clause, specifier] = match;
      const identifiers = importedIdentifiers(clause!);
      // By name, or by scope when Moderno names the component differently
      // (Ark's SegmentGroup is Moderno's SegmentedControl, scope "segment-group").
      const matchedComponent = manifest?.components.find((c) =>
        identifiers.some(
          (id) => id.toLowerCase() === c.name.toLowerCase() || scopeOf(id) === c.scope,
        ),
      );
      findings.push({
        ruleId: "moderno/no-raw-ark",
        severity: "error",
        loc: offsetToLoc(ctx.code, match.index),
        message: `Raw import from "${specifier}" bypasses Moderno's shared stylesheet and recipe.`,
        suggestion: matchedComponent
          ? `Use ${matchedComponent.import} instead.`
          : "Use the matching @moderno primitive instead — call search_components to find it.",
      });
    }
    return findings;
  },
};
