/**
 * Reads a docs MDX page's YAML front-matter outside of Astro's content
 * collection loader (this runs from a package's build step, not the docs
 * build). Guidance is authored once in English and reused verbatim across
 * every framework's manifest — the manifest's `guidance` is not translated.
 */
import { readFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";
import type { AgentGuidance } from "./agent-manifest.ts";

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---/;

export function readFrontmatter(mdxFilePath: string): Record<string, unknown> {
  const source = readFileSync(mdxFilePath, "utf8");
  const match = FRONTMATTER.exec(source);
  if (!match) return {};
  return (parseYaml(match[1]!) ?? {}) as Record<string, unknown>;
}

/** The `agent:` block, or `undefined` when the page hasn't been given one yet. */
export function readAgentGuidance(mdxFilePath: string): AgentGuidance | undefined {
  const frontmatter = readFrontmatter(mdxFilePath);
  return frontmatter.agent as AgentGuidance | undefined;
}
