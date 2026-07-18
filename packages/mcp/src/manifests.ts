/**
 * Discovers and aggregates `moderno.agent.json` from the consumer's
 * `node_modules` at startup (ADR-0003: a local server pinned to the
 * *installed* package version, not a bundled snapshot). Walks up from `cwd`
 * looking for a `node_modules/@moderno` directory — the same directory Node's
 * own resolution would land on for a bare `@moderno/*` import from `cwd` — and
 * reads every package's `dist/moderno.agent.json` it finds there.
 *
 * The manifest shape is imported (type-only — erased at build, no runtime
 * dependency on `@moderno/props-doc`'s ts-morph toolchain) from the package
 * that actually generates `moderno.agent.json`, so this can't silently drift
 * from what's really on disk the way a hand-copied duplicate would.
 *
 * No schema validation here: the manifest shape is a contract with the
 * `@moderno/*` build pipeline (`docs/prd/phase-7/moderno.agent.schema.json`),
 * not something this server needs to defend against — a malformed manifest is
 * a Moderno release bug, not untrusted input.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { ComponentsManifest, Framework } from "@moderno/props-doc/agent-manifest";
import type { ContractManifest } from "@moderno/props-doc/contract-manifest";

export type {
  AgentComponent,
  AgentExample,
  AgentGuidance,
  AgentPart,
  AgentProp,
} from "@moderno/props-doc/agent-manifest";
export type { ComponentsManifest, ContractManifest, Framework };

export type AgentManifest = ComponentsManifest | ContractManifest;

export interface AggregatedManifests {
  /** One components manifest per `@moderno/*` framework package found. */
  components: ComponentsManifest[];
  /** `@moderno/tokens`'s shared contract manifest, if that package is installed. */
  contract: ContractManifest | null;
  /** The `node_modules/@moderno` directory these were read from, for diagnostics. */
  scopeDir: string | null;
}

/**
 * Walks from `startDir` up to the filesystem root looking for the nearest
 * `node_modules/@moderno` directory — mirroring Node's own module resolution
 * so the server sees exactly what a bare `import "@moderno/react"` from that
 * directory would resolve against.
 */
function findModernoScopeDir(startDir: string): string | null {
  let dir = startDir;
  for (;;) {
    const candidate = join(dir, "node_modules", "@moderno");
    if (existsSync(candidate)) return candidate;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

function readManifest(packageDir: string): AgentManifest | null {
  const file = join(packageDir, "dist", "moderno.agent.json");
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, "utf8")) as AgentManifest;
  } catch {
    return null;
  }
}

/**
 * Discovers every installed `@moderno/*` package's manifest from `cwd`
 * (defaults to `process.cwd()`) and splits it into the framework-specific
 * `components` manifests and the single shared `contract` manifest.
 */
export function discoverManifests(cwd: string = process.cwd()): AggregatedManifests {
  const scopeDir = findModernoScopeDir(cwd);
  if (!scopeDir) return { components: [], contract: null, scopeDir: null };

  const components: ComponentsManifest[] = [];
  let contract: ContractManifest | null = null;

  for (const entry of readdirSync(scopeDir, { withFileTypes: true })) {
    if (!entry.isDirectory() && !entry.isSymbolicLink()) continue;
    const manifest = readManifest(join(scopeDir, entry.name));
    if (!manifest) continue;
    if (manifest.kind === "components") components.push(manifest);
    else if (manifest.kind === "contract") contract = manifest;
  }

  return { components, contract, scopeDir };
}
