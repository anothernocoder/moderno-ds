/**
 * `get_examples` — framework-specific snippets straight off the manifest's
 * `components[].examples` (curated at build time in
 * `@moderno-ui/props-doc`'s `agent-examples.ts`, one entry per (component,
 * framework), verified against each binding's own test fixtures). No separate
 * example store here: read the aggregated manifest, return what's there. A
 * block's example is its registry source in that framework (ADR-0012).
 */
import type { AgentExample, AggregatedManifests, Framework } from "@moderno-ui/lint-core";
import {
  componentNotFoundError,
  findComponentOrBlock,
  findFrameworkManifest,
  frameworkNotFoundError,
} from "./shared.ts";

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

  const component = findComponentOrBlock(manifest, input.name);
  if (!component) throw componentNotFoundError(manifest, input.name);

  return {
    name: component.name,
    framework: manifest.framework,
    examples: component.examples ?? [],
  };
}
