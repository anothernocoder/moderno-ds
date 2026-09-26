/**
 * The real components manifest, for the agent-examples suites: one file per
 * component under `test/rules/agent-examples/`, plus the generic "lint every
 * example" check in `test/rules/agent-examples.test.ts`.
 *
 * The manifests are built once per test run by `build-agent-manifests.ts` (the
 * project's globalSetup) and read here with `inject`, so a new component's file
 * costs no ts-morph build of its own.
 */
import { inject } from "vitest";
import { validProps } from "../../src/rules/valid-props.ts";
import type { AggregatedManifests, Framework } from "../../src/manifests.ts";

export { FRAMEWORKS } from "./build-agent-manifests.ts";

/** One framework's manifest, aggregated the way `discoverManifests` hands it to a rule. */
export function manifestsFor(framework: Framework): AggregatedManifests {
  return {
    components: [inject("agentManifests")[framework]],
    contract: null,
    scopeDir: null,
  };
}

/** What `moderno/valid-props` reports on a React snippet, as messages. */
export function checkReactProps(code: string): string[] {
  return validProps
    .check({ code, framework: "react", manifests: manifestsFor("react") })
    .map((finding) => finding.message);
}
