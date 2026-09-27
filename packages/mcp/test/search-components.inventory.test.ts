import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { AggregatedManifests } from "@moderno-ui/lint-core";
import {
  AGENT_COMPONENTS,
  buildComponentsManifest,
  resolveComponentProps,
  type Framework,
} from "../../../tooling/props-doc/src/agent-manifest.ts";
import { readAgentGuidance } from "../../../tooling/props-doc/src/mdx-frontmatter.ts";
import { searchComponents } from "../src/tools/search-components.ts";

/**
 * `search_components` over the manifests the four packages really ship, built
 * from source the way each package's build writes its `moderno.agent.json`
 * (props, parts and examples from props-doc, guidance from the English docs'
 * `agent:` blocks). The fixture in `search-components.test.ts` holds a few
 * components on purpose; this suite checks the whole inventory.
 */

const FRAMEWORKS: Framework[] = ["react", "vue", "svelte", "solid"];

const reactTsConfig = fileURLToPath(new URL("../../react/tsconfig.json", import.meta.url));
const docsDir = new URL("../../../apps/docs/src/content/docs/en/", import.meta.url);

/** One ts-morph extraction (5–10 s), shared by every framework's manifest. */
const resolvedProps = resolveComponentProps(AGENT_COMPONENTS, reactTsConfig);
const guidance = Object.fromEntries(
  AGENT_COMPONENTS.map((c) => [
    c.name,
    readAgentGuidance(fileURLToPath(new URL(`${c.slug}.mdx`, docsDir))),
  ]),
);

function shippedManifests(framework: Framework): AggregatedManifests {
  const manifest = buildComponentsManifest({
    packageName: `@moderno-ui/${framework}`,
    version: "0.0.0",
    framework,
    reactTsConfigFilePath: reactTsConfig,
    resolvedProps,
    guidance,
  });
  return { components: [manifest], contract: null, scopeDir: null };
}

const names = AGENT_COMPONENTS.map((c) => c.name).sort();

describe.each(FRAMEWORKS)("searchComponents over the shipped %s manifest", (framework) => {
  const manifests = shippedManifests(framework);

  it("returns every component when nothing in the query matches", () => {
    const result = searchComponents(manifests, { query: "xyzzy", framework });
    expect(result.matches.map((m) => m.name).sort()).toEqual(names);
  });

  it("ranks each component first when asked for it by name", () => {
    const missed = names.filter(
      (name) => searchComponents(manifests, { query: name, framework }).matches[0]?.name !== name,
    );
    expect(missed).toEqual([]);
  });
});
