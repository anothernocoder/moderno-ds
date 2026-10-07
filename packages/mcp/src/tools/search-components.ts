/**
 * `search_components` — find the right primitive by intent, not by knowing its
 * name up front. Scores every component in the requested framework's manifest
 * against the query's tokens (name, scope, and the curated `guidance` fields —
 * the judgment layer, not just the generated facts) and returns them ranked.
 */
import { rankComponents, type AggregatedManifests, type Framework } from "@moderno-ui/lint-core";
import { findFrameworkManifest, frameworkNotFoundError } from "./shared.ts";

export interface SearchComponentsInput {
  query: string;
  framework: Framework;
}

export interface SearchComponentsMatch {
  name: string;
  scope: string;
  import: string;
  score: number;
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

  const matches = rankComponents(manifest.components, input.query).map(
    ({ component: c, score }): SearchComponentsMatch => {
      const g = c.guidance;
      return {
        name: c.name,
        scope: c.scope,
        import: c.import,
        score,
        ...(g?.intent ? { intent: g.intent } : {}),
        ...(g?.whenToUse ? { whenToUse: g.whenToUse } : {}),
      };
    },
  );

  return { matches };
}
