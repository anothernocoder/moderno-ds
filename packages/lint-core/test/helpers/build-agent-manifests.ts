/**
 * globalSetup for the agent-examples project: builds the components manifest
 * for every framework once, and provides it to the suites as
 * `inject("agentManifests")` (read through `agent-manifests.ts`). It runs in the
 * main process, where `vitest` itself can't be imported.
 *
 * Deliberately built from source rather than read out of a package's built
 * `dist`: the manifest a consumer installs is exactly what
 * `buildComponentsManifest` produces, and building it here means the suites
 * don't need a prior `pnpm -r build` to be meaningful.
 */
import { fileURLToPath } from "node:url";
import type { TestProject } from "vitest/node";
import {
  buildComponentsManifest,
  type ComponentsManifest,
} from "../../../../tooling/props-doc/src/agent-manifest.ts";
import type { Framework } from "../../src/manifests.ts";

declare module "vitest" {
  export interface ProvidedContext {
    agentManifests: Record<Framework, ComponentsManifest>;
  }
}

/** Every framework `AGENT_EXAMPLES` ships snippets for. */
export const FRAMEWORKS: Framework[] = ["react", "vue", "svelte", "solid"];

const reactTsConfig = fileURLToPath(new URL("../../../react/tsconfig.json", import.meta.url));

export default function buildAgentManifests(project: TestProject): void {
  const manifests = Object.fromEntries(
    FRAMEWORKS.map((framework) => [
      framework,
      buildComponentsManifest({
        packageName: `@moderno-ui/${framework}`,
        version: "0.0.0",
        framework,
        reactTsConfigFilePath: reactTsConfig,
        guidance: {},
      }),
    ]),
  ) as Record<Framework, ComponentsManifest>;

  project.provide("agentManifests", manifests);
}
