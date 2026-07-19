#!/usr/bin/env node
/**
 * CI guard (issue #45) — fail the build if a vertical-slice primitive is
 * missing its `agent:` MDX front-matter block, or if `props-doc`'s generated
 * props hash for that component no longer matches the `agentPropsHash` the
 * block was last reviewed against. Reads the English docs directly (guidance
 * is authored once in English, see `mdx-frontmatter.ts`) rather than building
 * a full `moderno.agent.json`, so this runs standalone in CI without a prior
 * package build.
 */
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  AGENT_COMPONENTS,
  computePropsHash,
  resolveComponentProps,
  type AgentGuidance,
} from "./agent-manifest.ts";
import { checkAgentDrift, type AgentDriftCheckInput } from "./agent-drift.ts";
import { readFrontmatter } from "./mdx-frontmatter.ts";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../../..");
const REACT_TSCONFIG = join(repoRoot, "packages/react/tsconfig.json");
const DOCS_EN_DIR = join(repoRoot, "apps/docs/src/content/docs/en");

function main(): number {
  const propsByName = resolveComponentProps(AGENT_COMPONENTS, REACT_TSCONFIG);

  const inputs: AgentDriftCheckInput[] = AGENT_COMPONENTS.map((c) => {
    const frontmatter = readFrontmatter(join(DOCS_EN_DIR, `${c.slug}.mdx`));
    return {
      name: c.name,
      slug: c.slug,
      agent: frontmatter.agent as AgentGuidance | undefined,
      agentPropsHash: frontmatter.agentPropsHash as string | undefined,
      currentPropsHash: computePropsHash(propsByName.get(c.name) ?? []),
    };
  });

  const issues = checkAgentDrift(inputs);
  if (issues.length > 0) {
    console.error("✗ agent: block drift detected:");
    for (const issue of issues) {
      const file = `apps/docs/src/content/docs/en/${issue.slug}.mdx`;
      if (issue.reason === "missing-agent-block") {
        console.error(`  ${issue.name} (${file}) — missing an agent: front-matter block`);
      } else {
        console.error(
          `  ${issue.name} (${file}) — props changed since the agent: block was last reviewed; ` +
            "update the block's guidance and set agentPropsHash to the value reported below",
        );
      }
    }
    console.error("");
    console.error("current props hashes:");
    for (const { name, currentPropsHash } of inputs) {
      console.error(`  ${name}: ${currentPropsHash}`);
    }
    return 1;
  }

  console.log(`✓ agent: blocks current for all ${AGENT_COMPONENTS.length} components`);
  return 0;
}

process.exit(main());
