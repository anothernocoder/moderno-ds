/**
 * `get_examples` — framework-specific snippets straight off the manifest's
 * `components[].examples` (curated at build time in
 * `@moderno/props-doc`'s `agent-examples.ts`, one entry per (component,
 * framework), verified against each binding's own test fixtures). No separate
 * example store here: read the aggregated manifest, return what's there.
 */
import type { AgentExample, AggregatedManifests, Framework } from "@moderno/lint-core";
import { componentNotFoundError, findFrameworkManifest, frameworkNotFoundError } from "./shared.ts";

export interface GetExamplesInput {
  name: string;
  framework: Framework;
}

export interface GetExamplesResult {
  name: string;
  framework: Framework;
  examples: AgentExample[];
}

export function getExamples(
  manifests: AggregatedManifests,
  input: GetExamplesInput,
): GetExamplesResult {
  const manifest = findFrameworkManifest(manifests, input.framework);
  if (!manifest) throw frameworkNotFoundError(manifests, input.framework);

  const component = manifest.components.find(
    (c) => c.name.toLowerCase() === input.name.toLowerCase(),
  );
  if (!component) throw componentNotFoundError(manifest, input.name);

  return {
    name: component.name,
    framework: manifest.framework,
    examples: component.examples ?? [],
  };
}
