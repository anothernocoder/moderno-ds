/**
 * `search_components` — find the right primitive by intent, not by knowing its
 * name up front. Scores every component in the requested framework's manifest
 * against the query's tokens (name, scope, and the curated `guidance` fields —
 * the judgment layer, not just the generated facts) and returns them ranked.
 */
import type { AgentComponent, AggregatedManifests, Framework } from "../manifests.ts";
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

function haystack(component: AgentComponent): string {
  const g = component.guidance;
  return [
    component.name,
    component.scope,
    g?.intent,
    g?.whenToUse,
    ...(g?.gotchas ?? []),
    ...(g?.theming ?? []),
    ...(g?.whenNotToUse ?? []).flatMap((w) => [w.case, w.use]),
  ]
    .filter((s): s is string => Boolean(s))
    .join(" ")
    .toLowerCase();
}

function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function score(component: AgentComponent, tokens: string[]): number {
  if (tokens.length === 0) return 0;
  const hay = haystack(component);
  const name = component.name.toLowerCase();
  let s = 0;
  for (const token of tokens) {
    if (name === token) s += 5;
    else if (name.includes(token)) s += 3;
    else if (hay.includes(token)) s += 1;
  }
  return s;
}

export function searchComponents(
  manifests: AggregatedManifests,
  input: SearchComponentsInput,
): SearchComponentsResult {
  const manifest = findFrameworkManifest(manifests, input.framework);
  if (!manifest) throw frameworkNotFoundError(manifests, input.framework);

  const tokens = tokenize(input.query);
  const matches = manifest.components
    .map((c): SearchComponentsMatch => {
      const g = c.guidance;
      return {
        name: c.name,
        scope: c.scope,
        import: c.import,
        score: score(c, tokens),
        ...(g?.intent ? { intent: g.intent } : {}),
        ...(g?.whenToUse ? { whenToUse: g.whenToUse } : {}),
      };
    })
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  return { matches };
}
