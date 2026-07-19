/**
 * `get_component_api` — props/slots/`data-part`s straight off the manifest
 * the *installed* `@moderno/<framework>` package emitted at build. Stamping
 * `package`/`version` on the result is what makes F7.3 true end-to-end: a repo
 * pinned to an older `@moderno/react` gets that version's API, not latest,
 * because the manifest was read from that package's own `dist`.
 */
import type { AgentComponent, AggregatedManifests, Framework } from "@moderno/lint-core";
import { componentNotFoundError, findFrameworkManifest, frameworkNotFoundError } from "./shared.ts";

export interface GetComponentApiInput {
  name: string;
  framework: Framework;
}

export interface GetComponentApiResult {
  package: string;
  version: string;
  framework: Framework;
  component: AgentComponent;
}

export function getComponentApi(
  manifests: AggregatedManifests,
  input: GetComponentApiInput,
): GetComponentApiResult {
  const manifest = findFrameworkManifest(manifests, input.framework);
  if (!manifest) throw frameworkNotFoundError(manifests, input.framework);

  const component = manifest.components.find(
    (c) => c.name.toLowerCase() === input.name.toLowerCase(),
  );
  if (!component) throw componentNotFoundError(manifest, input.name);

  return {
    package: manifest.package,
    version: manifest.version,
    framework: manifest.framework,
    component,
  };
}
