/**
 * The starter rule set (`docs/prd/phase-7/validate-rules.md`), authored once
 * so it can be exposed twice per ADR-0003: `@moderno/mcp`'s `validate_usage`
 * tool and `@moderno/lint` (ESLint plugin + CLI) both run these same `Rule`
 * implementations against the same manifests, so a snippet gets identical
 * findings from either surface.
 */
import { noHardcodedColor } from "./no-hardcoded-color.ts";
import { noHardcodedDimension } from "./no-hardcoded-dimension.ts";
import { noRawArk } from "./no-raw-ark.ts";
import { noReimplementedPrimitive } from "./no-reimplemented-primitive.ts";
import type { Finding, Rule, RuleContext } from "./types.ts";
import { validDataPartOverride } from "./valid-data-part-override.ts";
import { validProps } from "./valid-props.ts";

export type { Finding, Loc, Rule, RuleContext, Severity } from "./types.ts";

export const ALL_RULES: Rule[] = [
  noHardcodedColor,
  noHardcodedDimension,
  validProps,
  noRawArk,
  validDataPartOverride,
  noReimplementedPrimitive,
];

/** Runs every rule applicable to `ctx.framework`, findings ordered by source position. */
export function runRules(ctx: RuleContext, rules: Rule[] = ALL_RULES): Finding[] {
  return rules
    .filter((rule) => rule.frameworks === "all" || rule.frameworks.includes(ctx.framework))
    .flatMap((rule) => rule.check(ctx))
    .sort((a, b) => a.loc.line - b.loc.line || a.loc.col - b.loc.col);
}
