/**
 * `validate_usage` — the deterministic verification half of the agentic loop
 * (ADR-0003): runs `@moderno/lint-core`'s shared rule engine over a framework-
 * tagged snippet against the same manifests the other four tools read,
 * catching hallucinated props, off-contract colors/radii, raw Ark usage, bad
 * `data-part` overrides, and reimplemented primitives before the agent
 * finishes. `@moderno/lint` runs the identical rules over the same manifests,
 * so a human/CI lint and this tool never disagree. Requires the target
 * framework to be installed, like every other tool here — there is nothing to
 * validate against otherwise.
 */
import {
  ALL_RULES,
  runRules,
  type AggregatedManifests,
  type Finding,
  type Framework,
} from "@moderno/lint-core";
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
