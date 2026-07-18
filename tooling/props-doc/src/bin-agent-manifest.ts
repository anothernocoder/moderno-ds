#!/usr/bin/env node
/**
 * `moderno-agent-manifest <react|vue|svelte|solid|tokens> [outDir]` — emit
 * `<outDir>/moderno.agent.json` for one package, run as a package's own build
 * step (cwd = that package's root, so `package.json` next door gives the
 * `version`; `outDir` defaults to `dist`, matching every package's own build
 * output).
 *
 * Guidance is read once from the English docs (`apps/docs/src/content/docs/en`)
 * and reused verbatim across every framework's manifest — see
 * `mdx-frontmatter.ts`.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  AGENT_COMPONENTS,
  buildComponentsManifest,
  buildContractManifest,
  type AgentGuidance,
  type Framework,
} from "./agent-manifest.ts";
import { readAgentGuidance } from "./mdx-frontmatter.ts";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../../..");
const REACT_TSCONFIG = join(repoRoot, "packages/react/tsconfig.json");
const DOCS_EN_DIR = join(repoRoot, "apps/docs/src/content/docs/en");

const FRAMEWORK_PACKAGES: Record<string, { packageName: string; framework: Framework }> = {
  react: { packageName: "@moderno/react", framework: "react" },
  vue: { packageName: "@moderno/vue", framework: "vue" },
  svelte: { packageName: "@moderno/svelte", framework: "svelte" },
  solid: { packageName: "@moderno/solid", framework: "solid" },
};

function readVersion(packageDir: string): string {
  const pkg = JSON.parse(readFileSync(join(packageDir, "package.json"), "utf8")) as {
    version: string;
  };
  return pkg.version;
}

function readAllGuidance(): Record<string, AgentGuidance | undefined> {
  return Object.fromEntries(
    AGENT_COMPONENTS.map((c) => [c.name, readAgentGuidance(join(DOCS_EN_DIR, `${c.slug}.mdx`))]),
  );
}

function main(): number {
  const [target, outDirArg] = process.argv.slice(2);
  if (!target || !(target === "tokens" || target in FRAMEWORK_PACKAGES)) {
    console.error("usage: moderno-agent-manifest <react|vue|svelte|solid|tokens> [outDir]");
    return 1;
  }

  const packageDir = process.cwd();
  const outDir = resolve(outDirArg ?? join(packageDir, "dist"));
  mkdirSync(outDir, { recursive: true });

  const manifest =
    target === "tokens"
      ? buildContractManifest(readVersion(packageDir))
      : buildComponentsManifest({
          ...FRAMEWORK_PACKAGES[target]!,
          version: readVersion(packageDir),
          reactTsConfigFilePath: REACT_TSCONFIG,
          guidance: readAllGuidance(),
        });

  const file = join(outDir, "moderno.agent.json");
  writeFileSync(file, JSON.stringify(manifest, null, 2) + "\n");
  const count = "components" in manifest ? manifest.components.length : 0;
  console.log(
    `✓ moderno.agent.json (${manifest.kind}${count ? `, ${count} components` : ""}) → ${file}`,
  );
  return 0;
}

process.exit(main());
