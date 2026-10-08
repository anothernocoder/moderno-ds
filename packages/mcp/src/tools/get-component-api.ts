/**
 * `get_component_api` — props/slots/`data-part`s straight off the manifest
 * the *installed* `@moderno-ui/<framework>` package emitted at build. Stamping
 * `package`/`version` on the result is what makes F7.3 true end-to-end: a repo
 * pinned to an older `@moderno-ui/react` gets that version's API, not latest,
 * because the manifest was read from that package's own `dist`. A block's
 * entry (ADR-0012) comes back the same way: its props, object `shapes` and
 * `install` command.
 */
import type {
  AgentBlock,
  AgentComponent,
  AggregatedManifests,
  Framework,
} from "@moderno-ui/lint-core";
import {
  componentNotFoundError,
  findComponentOrBlock,
  findFrameworkManifest,
  frameworkNotFoundError,
} from "./shared.ts";

export interface GetComponentApiInput {
  name: string;
  framework: Framework;
}

export interface GetComponentApiResult {
  package: string;
  version: string;
  framework: Framework;
  /** A primitive, or a block (`kind: "block"`, installed with its `install` command). */
  component: AgentComponent | AgentBlock;
}

export function getComponentApi(
  manifests: AggregatedManifests,
  input: GetComponentApiInput,
): GetComponentApiResult {
  const manifest = findFrameworkManifest(manifests, input.framework);
  if (!manifest) throw frameworkNotFoundError(manifests, input.framework);

  const component = findComponentOrBlock(manifest, input.name);
  if (!component) throw componentNotFoundError(manifest, input.name);

  return {
    package: manifest.package,
    version: manifest.version,
    framework: manifest.framework,
    component,
  };
}
