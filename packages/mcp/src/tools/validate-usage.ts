/**
 * `validate_usage` — the deterministic verification half of the agentic loop
 * (ADR-0003): runs the shared rule engine (`../rules/`) over a framework-
 * tagged snippet against the same manifests the other four tools read,
 * catching hallucinated props, off-contract colors/radii, raw Ark usage, bad
 * `data-part` overrides, and reimplemented primitives before the agent
 * finishes. Requires the target framework to be installed, like every other
 * tool here — there is nothing to validate against otherwise.
 */
import type { AggregatedManifests, Framework } from "../manifests.ts";
import { ALL_RULES, runRules, type Finding } from "../rules/index.ts";
import { findFrameworkManifest, frameworkNotFoundError } from "./shared.ts";

export interface ValidateUsageInput {
  /** The snippet or file content to lint. */
  code: string;
  framework: Framework;
}

export interface ValidateUsageResult {
  /** Empty means clean. */
  findings: Finding[];
}

export function validateUsage(
  manifests: AggregatedManifests,
  input: ValidateUsageInput,
): ValidateUsageResult {
  if (!findFrameworkManifest(manifests, input.framework)) {
    throw frameworkNotFoundError(manifests, input.framework);
  }

  return {
    findings: runRules({ code: input.code, framework: input.framework, manifests }, ALL_RULES),
  };
}
