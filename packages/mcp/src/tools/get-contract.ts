/**
 * `get_contract` — theming rules, token slots, and the `data-part` model.
 * Shared and framework-agnostic (ADR-0003): the contract lives once in
 * `@moderno-ui/tokens`'s manifest and is identical no matter which binding the
 * agent is writing against, so — unlike the other three tools — this one
 * doesn't need a `framework` argument to answer.
 */
import type { AggregatedManifests, ContractManifest } from "@moderno-ui/lint-core";
import { ModernoMcpError } from "./shared.ts";

export type GetContractResult = ContractManifest;

export function getContract(manifests: AggregatedManifests): GetContractResult {
  if (!manifests.contract) {
    throw new ModernoMcpError(
      "No contract manifest found — is @moderno-ui/tokens installed?" +
        (manifests.scopeDir ? ` (looked under ${manifests.scopeDir})` : ""),
    );
  }
  return manifests.contract;
}
