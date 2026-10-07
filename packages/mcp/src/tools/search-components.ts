/**
 * `search_components` — find the right primitive or block by intent, not by
 * knowing its name up front. Scores every primitive and block (ADR-0012) in
 * the requested framework's manifest against the query's tokens (name, scope
 * or description, and the curated `guidance` fields — the judgment layer, not
 * just the generated facts) and returns them ranked. A primitive says how to
 * import it; a block says how to install it.
 */
import { rankComponents, type AggregatedManifests, type Framework } from "@moderno-ui/lint-core";
import { findFrameworkManifest, frameworkNotFoundError } from "./shared.ts";

export interface SearchComponentsInput {
  query: string;
  framework: Framework;
}

export interface SearchComponentsMatch {
  name: string;
  kind: "primitive" | "block";
  score: number;
  /** Primitives only: the `data-scope` value. */
  scope?: string;
  /** Primitives only. */
  import?: string;
  /** Blocks only: the CLI command that copies the block into the app. */
  install?: string;
  intent?: string;
  whenToUse?: string;
}

export interface SearchComponentsResult {
  matches: SearchComponentsMatch[];
}

export function searchComponents(
  manifests: AggregatedManifests,
  input: SearchComponentsInput,
): SearchComponentsResult {
  const manifest = findFrameworkManifest(manifests, input.framework);
  if (!manifest) throw frameworkNotFoundError(manifests, input.framework);

  const entries = [...manifest.components, ...(manifest.blocks ?? [])];
  const matches = rankComponents(entries, input.query).map(
    ({ component: c, score }): SearchComponentsMatch => {
      const g = c.guidance;
      return {
        name: c.name,
        ...("install" in c
          ? { kind: "block" as const, score, install: c.install }
          : { kind: "primitive" as const, score, scope: c.scope, import: c.import }),
        ...(g?.intent ? { intent: g.intent } : {}),
        ...(g?.whenToUse ? { whenToUse: g.whenToUse } : {}),
      };
    },
  );

  return { matches };
}
