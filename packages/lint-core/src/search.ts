/**
 * Ranks components (primitives and blocks) against a free-text query by their
 * name, scope or description, and curated `guidance`. Free and local:
 * `@moderno-ui/mcp`'s `search_components` answers with it, and
 * `@moderno-ui/genui`'s router shortlists with it.
 */
import type { AgentGuidance } from "@moderno-ui/props-doc/agent-manifest";

/** What ranking reads from a primitive (`AgentComponent`) or a block (`AgentBlock`). */
export interface Rankable {
  name: string;
  scope?: string;
  description?: string;
  kind?: string;
  guidance?: AgentGuidance;
}

export interface RankedComponent<T extends Rankable = Rankable> {
  component: T;
  score: number;
}

function haystack(component: Rankable): string {
  const g = component.guidance;
  return [
    component.name,
    component.scope,
    component.description,
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

function score(component: Rankable, tokens: string[]): number {
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

/** 0 for a block, 1 for a primitive: on a tie the block wins, since it already composes the primitive. */
function kindOrder(component: Rankable): number {
  return component.kind === "block" ? 0 : 1;
}

/** Every component with its score for `query`, best first; ties go to blocks, then by name. */
export function rankComponents<T extends Rankable>(
  components: T[],
  query: string,
): RankedComponent<T>[] {
  const tokens = tokenize(query);
  return components
    .map((component) => ({ component, score: score(component, tokens) }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        kindOrder(a.component) - kindOrder(b.component) ||
        a.component.name.localeCompare(b.component.name),
    );
}
