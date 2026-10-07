/**
 * The registry's Blocks in `moderno.agent.json` (ADR-0012), read from each
 * block's own files: `registry/blocks/<slug>/item.json` and its React source.
 * A new block adds no code here: it is found by its folder.
 *
 * - `props` and `shapes` come from the React block's `<Name>Props` interface,
 *   resolved by `extractProps` through `tsconfig.blocks.json`, with the object
 *   types it uses (`KpiCardMetric`) expanded into their fields.
 * - `propsHash` covers both, and `pnpm gen` records it in
 *   `blocks.generated.ts`: `agent:check-drift` fails when a block's props
 *   change and `pnpm gen` was not run.
 * - `examples` is the registry item itself, per the Example rule.
 *
 * Only `import type` from the manifest modules: `pnpm gen` loads this file
 * before any package is built.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { extractProps, type ComponentDoc, type PropDoc } from "./index.ts";
import type { AgentExample, AgentGuidance, Framework } from "./agent-manifest.ts";

export const BLOCKS_DIR = "registry/blocks";
const BLOCKS_TSCONFIG = "tooling/props-doc/tsconfig.blocks.json";

/** What a block's folder says about it. */
export interface RegistryBlock {
  /** Folder name, e.g. `kpi-card`. */
  slug: string;
  /** Component name, e.g. `KpiCard`. */
  name: string;
  title: string;
  /** `item.json`'s description, `{framework}` still in it. */
  description: string;
  /** Repo-relative source file per framework the block ships in. */
  sources: Partial<Record<Framework, string>>;
}

/** One Block entry of `moderno.agent.json`. */
export interface AgentBlock {
  name: string;
  slug: string;
  kind: "block";
  description: string;
  install: string;
  frameworks: Framework[];
  propsHash: string;
  props: PropDoc[];
  shapes: Record<string, PropDoc[]>;
  /** The primitives the block's source renders. */
  composes: string[];
  examples: AgentExample[];
  guidance?: AgentGuidance;
}

interface ItemJson {
  title: string;
  description: string;
  files: Partial<Record<Framework, { path: string }[]>>;
}

/** `kpi-card` → `KpiCard`. */
function pascalCase(slug: string): string {
  return slug.replace(/(^|-)([a-z0-9])/g, (_, _dash: string, char: string) => char.toUpperCase());
}

/** Every block folder under `registry/blocks`, sorted by slug. */
export function listRegistryBlocks(repoRoot: string): RegistryBlock[] {
  const dir = join(repoRoot, BLOCKS_DIR);
  return readdirSync(dir)
    .filter((slug) => existsSync(join(dir, slug, "item.json")))
    .sort()
    .map((slug) => {
      const item = JSON.parse(readFileSync(join(dir, slug, "item.json"), "utf8")) as ItemJson;
      const sources = Object.fromEntries(
        Object.entries(item.files)
          .filter(([, files]) => files?.[0])
          .map(([framework, files]) => [framework, `registry/${files![0]!.path}`]),
      );
      return {
        slug,
        name: pascalCase(slug),
        title: item.title,
        description: item.description,
        sources,
      };
    });
}

/**
 * Extracts each block's props and shapes from its React source, keyed by
 * slug. A block without a React source has no entry. `tsConfigFilePath`
 * defaults to `tsconfig.blocks.json`; a test passes its own to extract a
 * changed copy.
 */
export function resolveBlockProps(
  blocks: RegistryBlock[],
  repoRoot: string,
  tsConfigFilePath = join(repoRoot, BLOCKS_TSCONFIG),
): Map<string, ComponentDoc> {
  const withReact = blocks.filter((b) => b.sources.react);
  const docs = extractProps({
    tsConfigFilePath,
    entries: withReact.map((b) => ({
      name: b.slug,
      file: resolve(repoRoot, b.sources.react!),
      type: `${b.name}Props`,
    })),
    // A block is copied into the app, so its own file counts as workspace
    // source; dependencies (React's types) stay out.
    include: (path) => !path.replace(/\\/g, "/").includes("/node_modules/"),
    expandShapes: true,
  });
  return new Map(docs.map((d) => [d.name, d]));
}

/** sha256 of a block's props and shapes: what `pnpm gen` records. */
export function blockPropsHash(doc: ComponentDoc | undefined): string {
  const value = JSON.stringify({ props: doc?.props ?? [], shapes: doc?.shapes ?? {} });
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

/** The primitives a React block imports by value from `@moderno-ui/react`. */
function composedPrimitives(source: string, primitives: ReadonlySet<string>): string[] {
  const names = new Set<string>();
  for (const [, list] of source.matchAll(/import\s*\{([^}]*)\}\s*from\s*"@moderno-ui\/react"/g)) {
    for (const spec of list!.split(",")) {
      const name = spec.trim().split(/\s+as\s+/)[0]!;
      if (primitives.has(name)) names.add(name);
    }
  }
  return [...names].sort();
}

export interface BuildAgentBlocksOptions {
  repoRoot: string;
  framework: Framework;
  blocks: RegistryBlock[];
  /** From `resolveBlockProps`. */
  resolvedProps: Map<string, ComponentDoc>;
  /** Primitive names (`AGENT_COMPONENTS`), to tell what a block composes. */
  primitives: string[];
  /** Curated guidance per block name, from each docs page's `agent:` block. */
  guidance: Record<string, AgentGuidance | undefined>;
}

/** The Blocks that ship in `framework`, as manifest entries. */
export function buildAgentBlocks(opts: BuildAgentBlocksOptions): AgentBlock[] {
  const primitives = new Set(opts.primitives);
  return opts.blocks
    .filter((b) => b.sources[opts.framework])
    .map((b): AgentBlock => {
      const doc = opts.resolvedProps.get(b.slug);
      const read = (path: string) => readFileSync(resolve(opts.repoRoot, path), "utf8");
      const guidance = opts.guidance[b.name];
      return {
        name: b.name,
        slug: b.slug,
        kind: "block",
        description: b.description.replaceAll("{framework}", opts.framework),
        install: `npx @moderno-ui/cli add ${b.slug}-${opts.framework}`,
        frameworks: Object.keys(b.sources) as Framework[],
        propsHash: blockPropsHash(doc),
        props: doc?.props ?? [],
        shapes: doc?.shapes ?? {},
        composes: b.sources.react ? composedPrimitives(read(b.sources.react), primitives) : [],
        examples: [{ title: b.title, code: read(b.sources[opts.framework]!) }],
        ...(guidance ? { guidance } : {}),
      };
    });
}

export type BlockDriftReason = "props-changed" | "not-generated" | "removed";

export interface BlockDriftIssue {
  slug: string;
  reason: BlockDriftReason;
}

/**
 * Compares the hashes `pnpm gen` recorded with the ones the sources give
 * now. Any difference means the manifest no longer matches the blocks.
 */
export function checkBlockDrift(
  recorded: Record<string, string>,
  current: Record<string, string>,
): BlockDriftIssue[] {
  const slugs = [...new Set([...Object.keys(recorded), ...Object.keys(current)])].sort();
  return slugs.flatMap((slug): BlockDriftIssue[] => {
    if (!(slug in current)) return [{ slug, reason: "removed" }];
    if (!(slug in recorded)) return [{ slug, reason: "not-generated" }];
    return recorded[slug] === current[slug] ? [] : [{ slug, reason: "props-changed" }];
  });
}

/** The current props hash of every block with a React source, keyed by slug. */
export function currentBlockHashes(repoRoot: string): Record<string, string> {
  const blocks = listRegistryBlocks(repoRoot);
  const resolved = resolveBlockProps(blocks, repoRoot);
  return Object.fromEntries(
    blocks
      .filter((b) => resolved.has(b.slug))
      .map((b) => [b.slug, blockPropsHash(resolved.get(b.slug))]),
  );
}
