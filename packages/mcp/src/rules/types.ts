/**
 * The `Rule`/`Finding` contract from `docs/prd/phase-7/validate-rules.md` —
 * frozen here so `validate_usage` and a future `@moderno/lint` (#44) can share
 * rule implementations without redesign. A rule is a pure function of parsed
 * source + the aggregated manifests; nothing here is MCP-specific.
 */
import type { AggregatedManifests, Framework } from "../manifests.ts";

export type Severity = "error" | "warn";

export interface Loc {
  line: number;
  col: number;
}

export interface Finding {
  ruleId: string;
  severity: Severity;
  loc: Loc;
  message: string;
  suggestion?: string;
}

export interface RuleContext {
  /** The snippet or file content being checked. */
  code: string;
  framework: Framework;
  manifests: AggregatedManifests;
}

export interface Rule {
  /** `moderno/<name>`. */
  id: string;
  severity: Severity;
  frameworks: Framework[] | "all";
  check(ctx: RuleContext): Finding[];
  fixable?: boolean;
}
