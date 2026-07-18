/**
 * `moderno/no-hardcoded-color` (validate-rules.md #1) — hex/rgb/hsl/oklch
 * literals bypass the token contract; components may only reference a
 * `--slot`. Framework-agnostic: the pattern is textual, not markup-specific.
 */
import type { Finding, Rule } from "./types.ts";
import { offsetToLoc } from "./text.ts";

const COLOR_LITERAL =
  /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})\b|\b(?:rgb|rgba|hsl|hsla|oklch)\([^)]*\)/g;

export const noHardcodedColor: Rule = {
  id: "moderno/no-hardcoded-color",
  severity: "error",
  frameworks: "all",
  fixable: true,
  check(ctx): Finding[] {
    const slot = ctx.manifests.contract?.slots.color[0] ?? "--foreground";
    const findings: Finding[] = [];
    for (const match of ctx.code.matchAll(COLOR_LITERAL)) {
      findings.push({
        ruleId: "moderno/no-hardcoded-color",
        severity: "error",
        loc: offsetToLoc(ctx.code, match.index),
        message: `Hardcoded color "${match[0]}" bypasses the token contract — components may only reference a contract slot.`,
        suggestion: `Reference a contract color slot instead, e.g. var(${slot}).`,
      });
    }
    return findings;
  },
};
