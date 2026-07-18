/**
 * `moderno/valid-data-part-override` (validate-rules.md #6) — CSS targeting
 * `[data-scope="x"][data-part="y"]` must name a real part of that scope's
 * component, in either attribute order.
 */
import type { Finding, Rule } from "./types.ts";
import { closest, offsetToLoc } from "./text.ts";

const SCOPE_THEN_PART = /\[data-scope=(["'])([\w-]+)\1\]\s*\[data-part=(["'])([\w-]+)\3\]/g;
const PART_THEN_SCOPE = /\[data-part=(["'])([\w-]+)\1\]\s*\[data-scope=(["'])([\w-]+)\3\]/g;

interface PairMatch {
  scope: string;
  part: string;
  index: number;
}

function findPairs(code: string): PairMatch[] {
  const pairs: PairMatch[] = [];
  for (const m of code.matchAll(SCOPE_THEN_PART)) {
    pairs.push({ scope: m[2]!, part: m[4]!, index: m.index });
  }
  for (const m of code.matchAll(PART_THEN_SCOPE)) {
    pairs.push({ scope: m[4]!, part: m[2]!, index: m.index });
  }
  return pairs.sort((a, b) => a.index - b.index);
}

export const validDataPartOverride: Rule = {
  id: "moderno/valid-data-part-override",
  severity: "error",
  frameworks: "all",
  check(ctx): Finding[] {
    const manifest = ctx.manifests.components.find((m) => m.framework === ctx.framework);
    if (!manifest) return [];

    const findings: Finding[] = [];
    for (const { scope, part, index } of findPairs(ctx.code)) {
      const loc = offsetToLoc(ctx.code, index);
      const component = manifest.components.find((c) => c.scope === scope);
      if (!component) {
        findings.push({
          ruleId: "moderno/valid-data-part-override",
          severity: "error",
          loc,
          message: `No Moderno component has data-scope="${scope}".`,
        });
        continue;
      }
      const validParts = component.parts.map((p) => p.name);
      if (!validParts.includes(part)) {
        const suggestion = closest(validParts, part);
        findings.push({
          ruleId: "moderno/valid-data-part-override",
          severity: "error",
          loc,
          message: `[data-scope="${scope}"][data-part="${part}"]: "${part}" is not a real part of ${component.name}. Valid parts: ${validParts.join(", ")}.`,
          ...(suggestion ? { suggestion: `Did you mean "${suggestion}"?` } : {}),
        });
      }
    }
    return findings;
  },
};
