import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { AggregatedManifests } from "@moderno-ui/lint-core";
import {
  AGENT_COMPONENTS,
  buildComponentsManifest,
  resolveComponentProps,
  type Framework,
} from "../../../tooling/props-doc/src/agent-manifest.ts";
import {
  buildAgentBlocks,
  listRegistryBlocks,
} from "../../../tooling/props-doc/src/agent-blocks.ts";
import { readAgentGuidance } from "../../../tooling/props-doc/src/mdx-frontmatter.ts";
import { searchComponents } from "../src/tools/search-components.ts";

/**
 * `search_components` over the manifests the four packages really ship, built
 * from source the way each package's build writes its `moderno.agent.json`
 * (props, parts and examples from props-doc, guidance from the English docs'
 * `agent:` blocks), with every registry Block. The fixture in
 * `search-components.test.ts` holds a few components on purpose; this suite
 * checks the whole inventory.
 */

const FRAMEWORKS: Framework[] = ["react", "vue", "svelte", "solid"];

const reactTsConfig = fileURLToPath(new URL("../../react/tsconfig.json", import.meta.url));
const docsDir = new URL("../../../apps/docs/src/content/docs/en/", import.meta.url);
const repoRoot = fileURLToPath(new URL("../../..", import.meta.url));

/** One ts-morph extraction (5–10 s), shared by every framework's manifest. */
const resolvedProps = resolveComponentProps(AGENT_COMPONENTS, reactTsConfig);
function readGuidance(entries: { name: string; slug: string }[]) {
  return Object.fromEntries(
    entries.map((c) => [
      c.name,
      readAgentGuidance(fileURLToPath(new URL(`${c.slug}.mdx`, docsDir))),
    ]),
  );
}
const guidance = readGuidance(AGENT_COMPONENTS);
const registryBlocks = listRegistryBlocks(repoRoot);
const blockGuidance = readGuidance(registryBlocks);

function shippedManifests(framework: Framework): AggregatedManifests {
  const manifest = buildComponentsManifest({
    packageName: `@moderno-ui/${framework}`,
    version: "0.0.0",
    framework,
    reactTsConfigFilePath: reactTsConfig,
    resolvedProps,
    guidance,
    // Search reads no props, so the blocks skip their ts-morph extraction.
    blocks: buildAgentBlocks({
      repoRoot,
      framework,
      blocks: registryBlocks,
      resolvedProps: new Map(),
      primitives: AGENT_COMPONENTS.map((c) => c.name),
      guidance: blockGuidance,
    }),
  });
  return { components: [manifest], contract: null, scopeDir: null };
}

const primitiveNames = AGENT_COMPONENTS.map((c) => c.name);

describe.each(FRAMEWORKS)("searchComponents over the shipped %s manifest", (framework) => {
  const manifests = shippedManifests(framework);
  const blockNames = manifests.components[0]!.blocks!.map((b) => b.name);
  const names = [...primitiveNames, ...blockNames].sort();

  it("returns every component when nothing in the query matches", () => {
    const result = searchComponents(manifests, { query: "xyzzy", framework });
    expect(result.matches.map((m) => m.name).sort()).toEqual(names);
  });

  it("returns KpiCard, with its install command, first for 'kpi'", () => {
    const [first] = searchComponents(manifests, { query: "kpi", framework }).matches;
    expect(first).toMatchObject({
      name: "KpiCard",
      kind: "block",
      install: `npx @moderno-ui/cli add kpi-card-${framework}`,
    });
  });

  it("ranks each component and block first when asked for it by name", () => {
    const missed = names.filter(
      (name) => searchComponents(manifests, { query: name, framework }).matches[0]?.name !== name,
    );
    expect(missed).toEqual([]);
  });
});
