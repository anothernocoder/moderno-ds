/**
 * `moderno/no-hardcoded-dimension` (validate-rules.md #2) — issue #43's "What
 * to build" names hardcoded radii alongside color as a starter rule ("no
 * hardcoded colors/radii (must use tokens)"), so this ships the radius case
 * now. The PRD's fuller rule also covers motion durations and spacing; those
 * aren't added here since issue #43's acceptance criteria don't exercise
 * them, but they extend this same rule id later without a redesign.
 *
 * Two surfaces, one rule id. Consumers and blocks write CSS *and* Tailwind
 * utilities, and a length smuggled in through an arbitrary value
 * (`class="w-[320px]"`) bypasses the contract exactly as `width: 320px` does —
 * issue #77 makes blocks author with the preset, so the utility form has to be
 * caught too or the registry gate has a hole the size of a bracket.
 */
import type { Finding, Rule } from "./types.ts";
import { offsetToLoc } from "./text.ts";

const HARDCODED_RADIUS = /\bborder-radius\s*:\s*(-?[\d.]+)(px|rem)\b/g;

/**
 * Tailwind utilities whose arbitrary value is a raw length. Deliberately a
 * closed list of size/space/type utilities rather than "any `foo-[…]`": an
 * arbitrary value is the documented escape hatch for things the contract does
 * not name (`grid-cols-[repeat(auto-fit,minmax(0,1fr))]`, `bg-[url(…)]`), and
 * only the *dimension* families have a contract slot to point back at.
 */
const DIMENSION_UTILITIES = [
  "w",
  "h",
  "size",
  "min-w",
  "min-h",
  "max-w",
  "max-h",
  "basis",
  "p",
  "px",
  "py",
  "pt",
  "pr",
  "pb",
  "pl",
  "ps",
  "pe",
  "m",
  "mx",
  "my",
  "mt",
  "mr",
  "mb",
  "ml",
  "ms",
  "me",
  "gap",
  "gap-x",
  "gap-y",
  "space-x",
  "space-y",
  "inset",
  "inset-x",
  "inset-y",
  "top",
  "right",
  "bottom",
  "left",
  "text",
  "leading",
  "tracking",
  "rounded",
  "rounded-t",
  "rounded-r",
  "rounded-b",
  "rounded-l",
  "rounded-tl",
  "rounded-tr",
  "rounded-br",
  "rounded-bl",
];

const LENGTH_UNITS = "px|rem|em|ch|ex|vh|vw|vmin|vmax";

/**
 * `max-w-[42rem]`, `-mt-[3px]`, `@md:gap-[13px]` — the utility may carry a
 * variant prefix and a negative sign, and must be preceded by a class-list
 * boundary (start of string, whitespace, quote or backtick) so a longer
 * identifier that merely ends in one of the names cannot match.
 */
const HARDCODED_UTILITY_LENGTH = new RegExp(
  String.raw`(?<=^|[\s"'\`])(?:[\w@:.[\]/-]*:)?-?(?:${DIMENSION_UTILITIES.join("|")})-\[(-?[\d.]+(?:${LENGTH_UNITS}))\]`,
  "g",
);

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
    for (const match of ctx.code.matchAll(HARDCODED_UTILITY_LENGTH)) {
      findings.push({
        ruleId: "moderno/no-hardcoded-dimension",
        severity: "error",
        loc: offsetToLoc(ctx.code, match.index),
        message: `Hardcoded dimension "${match[0]}" bypasses the token contract — a Tailwind arbitrary value is a literal length.`,
        suggestion:
          "Use a preset utility backed by the contract (spacing/radius scales, max-w-sm|md|lg from --container-*), or a var() reference.",
      });
    }
    return findings.sort((a, b) => a.loc.line - b.loc.line || a.loc.col - b.loc.col);
  },
};
