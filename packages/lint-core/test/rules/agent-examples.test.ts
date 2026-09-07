/**
 * The DS's own documented usage must lint clean.
 *
 * `valid-props` compares markup against `moderno.agent.json`, and both sides
 * are generated: the manifest from the canonical React types, the snippets from
 * `AGENT_EXAMPLES`. Nothing tied the two together, so the rule could — and did
 * — report `<LineChart :x-ticks="3" />`, straight out of the Vue docs, as an
 * unknown prop. Running the real rule over every published example for every
 * shipped framework is the check that keeps a manifest change, a new snippet or
 * a rule tweak from making the DS fail its own linter.
 *
 * Deliberately built from source rather than read out of a package's built
 * `dist`: the manifest a consumer installs is exactly what
 * `buildComponentsManifest` produces, and building it here means the test
 * doesn't need a prior `pnpm -r build` to be meaningful.
 */
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildComponentsManifest } from "../../../../tooling/props-doc/src/agent-manifest.ts";
import { validProps } from "../../src/rules/valid-props.ts";
import type { AggregatedManifests, Framework } from "../../src/manifests.ts";

const reactTsConfig = fileURLToPath(
  new URL("../../../../packages/react/tsconfig.json", import.meta.url),
);

/** Every framework `AGENT_EXAMPLES` ships snippets for. */
const FRAMEWORKS: Framework[] = ["react", "vue", "svelte", "solid"];

function manifestsFor(framework: Framework): AggregatedManifests {
  return {
    components: [
      buildComponentsManifest({
        packageName: `@moderno-ui/${framework}`,
        version: "0.0.0",
        framework,
        reactTsConfigFilePath: reactTsConfig,
        guidance: {},
      }),
    ],
    contract: null,
    scopeDir: null,
  };
}

describe("moderno/valid-props over the shipped examples", () => {
  // Four ts-morph manifest builds in one test; the 5s default is not enough
  // under the full parallel run (see the root vitest.config.ts note).
  it("reports nothing on any component's example in any framework", { timeout: 60_000 }, () => {
    const reported: string[] = [];

    for (const framework of FRAMEWORKS) {
      const manifests = manifestsFor(framework);
      const manifest = manifests.components[0]!;
      expect(manifest.components.length).toBeGreaterThan(0);

      for (const component of manifest.components) {
        for (const example of component.examples ?? []) {
          for (const finding of validProps.check({ code: example.code, framework, manifests })) {
            reported.push(`${framework}/${component.name} — ${example.title}: ${finding.message}`);
          }
        }
      }
    }

    expect(reported).toEqual([]);
  });
});
