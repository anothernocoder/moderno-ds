/**
 * `get_contract` — theming rules, token slots, and the `data-part` model.
 * Shared and framework-agnostic (ADR-0003): the contract lives once in
 * `@moderno/tokens`'s manifest and is identical no matter which binding the
 * agent is writing against, so — unlike the other three tools — this one
 * doesn't need a `framework` argument to answer.
 */
import type { AggregatedManifests, ContractManifest } from "../manifests.ts";
import { ModernoMcpError } from "./shared.ts";

export type GetContractResult = ContractManifest;

export function getContract(manifests: AggregatedManifests): GetContractResult {
  if (!manifests.contract) {
    throw new ModernoMcpError(
      "No contract manifest found — is @moderno/tokens installed?" +
        (manifests.scopeDir ? ` (looked under ${manifests.scopeDir})` : ""),
    );
  }
  return manifests.contract;
}
