/**
 * `moderno/no-hardcoded-dimension` (validate-rules.md #2) — issue #43's "What
 * to build" names hardcoded radii alongside color as a starter rule ("no
 * hardcoded colors/radii (must use tokens)"), so this ships the radius case
 * now. The PRD's fuller rule also covers motion durations and spacing; those
 * aren't added here since issue #43's acceptance criteria don't exercise
 * them, but they extend this same rule id later without a redesign.
 */
import type { Finding, Rule } from "./types.ts";
import { offsetToLoc } from "./text.ts";

const HARDCODED_RADIUS = /\bborder-radius\s*:\s*(-?[\d.]+)(px|rem)\b/g;

export const noHardcodedDimension: Rule = {
  id: "moderno/no-hardcoded-dimension",
  severity: "error",
  frameworks: "all",
  fixable: true,
  check(ctx): Finding[] {
    const slot = ctx.manifests.contract?.slots.radius[0] ?? "--radius";
    const findings: Finding[] = [];
    for (const match of ctx.code.matchAll(HARDCODED_RADIUS)) {
      findings.push({
        ruleId: "moderno/no-hardcoded-dimension",
        severity: "error",
        loc: offsetToLoc(ctx.code, match.index),
        message: `Hardcoded border-radius "${match[1]}${match[2]}" bypasses the token contract.`,
        suggestion: `Reference a contract radius slot instead, e.g. border-radius: var(${slot}).`,
      });
    }
    return findings;
  },
};
