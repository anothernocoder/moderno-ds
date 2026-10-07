/**
 * Ranks components against a free-text query by their name, scope and curated
 * `guidance`. Free and local: `@moderno-ui/mcp`'s `search_components` answers
 * with it, and `@moderno-ui/genui`'s router shortlists with it.
 */
import type { AgentComponent } from "@moderno-ui/props-doc/agent-manifest";

export interface RankedComponent {
  component: AgentComponent;
  score: number;
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

/** Every component with its score for `query`, best first; ties by name. */
export function rankComponents(components: AgentComponent[], query: string): RankedComponent[] {
  const tokens = tokenize(query);
  return components
    .map((component) => ({ component, score: score(component, tokens) }))
    .sort((a, b) => b.score - a.score || a.component.name.localeCompare(b.component.name));
}
