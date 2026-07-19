#!/usr/bin/env node
/**
 * `moderno` CLI — init / add / update / diff over the versioned registry.
 * Zero runtime dependencies: arg parsing via node:util parseArgs.
 */
import { parseArgs } from "node:util";
import { detectRunner, installCommand, resolveRegistrySource, type Runner } from "./config.ts";
import { readManifest } from "./manifest.ts";
import { createRegistry, type RegistryClient } from "./registry.ts";
import { addItem, diffItem, initProject, updateItem } from "./operations.ts";

const HELP = `moderno — Moderno design system CLI

Usage:
  moderno init [--registry <url|path>] [--claude]
  moderno add <item...> [--registry <url|path>]
  moderno update [item...] [--registry <url|path>]
  moderno diff <item> [--registry <url|path>]
  moderno list [--registry <url|path>]

Registry resolution (highest precedence first):
  --registry flag · components.json "registry" · MODERNO_REGISTRY_URL · default

init:
  --claude   also write the AGENTS.md stanza as a CLAUDE.md twin
`;

async function loadRegistry(
  override: string | undefined,
  projectDir: string,
): Promise<RegistryClient> {
  const source = await resolveRegistrySource({ projectDir, override });
  return createRegistry(source).load();
}

function collectDeps(names: string[], registry: RegistryClient): string[] {
  const deps = new Set<string>();
  for (const name of names) {
    for (const d of registry.getItem(name)?.dependencies ?? []) deps.add(d);
  }
  return [...deps];
}

function printDepHint(deps: string[], runner: Runner): void {
  if (deps.length === 0) return;
  console.log(`\nInstall required dependencies:\n  ${installCommand(runner, deps)}`);
}

async function main(argv: string[]): Promise<number> {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      registry: { type: "string" },
      help: { type: "boolean", short: "h" },
      claude: { type: "boolean" },
    },
  });

  const command = positionals[0];
  const rest = positionals.slice(1);
  const projectDir = process.cwd();
  const registryOverride = values.registry as string | undefined;

  if (values.help || !command || command === "help") {
    console.log(HELP);
    return command && command !== "help" ? 1 : 0;
  }

  switch (command) {
    case "init": {
      const source = await resolveRegistrySource({ projectDir, override: registryOverride });
      const { agentsFiles } = await initProject({
        projectDir,
        registry: source,
        claude: values.claude as boolean | undefined,
      });
      console.log("✓ initialized: components.json + src/styles/moderno.css");
      console.log('  import it once in your app: import "@/styles/moderno.css"');
      console.log(`✓ wrote agent instructions: ${agentsFiles.join(", ")}`);
      return 0;
    }
    case "add": {
      if (rest.length === 0) return fail("add requires at least one item name");
      const registry = await loadRegistry(registryOverride, projectDir);
      const manifest = await readManifest(projectDir);
      for (const name of rest) {
        const { installed } = await addItem({ registry, projectDir, name, manifest });
        console.log(
          `✓ added ${name}${installed.length > 1 ? ` (+ ${installed.slice(0, -1).join(", ")})` : ""}`,
        );
      }
      printDepHint(collectDeps(rest, registry), await detectRunner(projectDir));
      return 0;
    }
    case "update": {
      const registry = await loadRegistry(registryOverride, projectDir);
      const manifest = await readManifest(projectDir);
      const names = rest.length > 0 ? rest : Object.keys(manifest.items);
      if (names.length === 0) return fail("nothing installed to update");
      for (const name of names) {
        const result = await updateItem({ registry, projectDir, name, manifest });
        const mark = result.status === "skipped-edited" ? "⚠" : "✓";
        console.log(`${mark} ${name}: ${result.status} (v${result.version})`);
        if (result.status === "skipped-edited") {
          console.log("  locally edited files were preserved; run `moderno diff` to inspect");
        }
      }
      return 0;
    }
    case "diff": {
      if (rest.length === 0) return fail("diff requires an item name");
      const registry = await loadRegistry(registryOverride, projectDir);
      const manifest = await readManifest(projectDir);
      let changed = false;
      for (const name of rest) {
        const result = await diffItem({ registry, projectDir, name, manifest });
        changed = changed || result.changed;
        if (!result.changed) {
          console.log(`✓ ${name}: up to date`);
          continue;
        }
        for (const f of result.files) if (f.diff) console.log(f.diff);
      }
      return changed ? 1 : 0;
    }
    case "list": {
      const registry = await loadRegistry(registryOverride, projectDir);
      const manifest = await readManifest(projectDir);
      for (const name of Object.keys(manifest.items)) {
        const item = registry.getItem(name);
        const latest = item ? ` (latest v${item.version})` : "";
        console.log(`- ${name} v${manifest.items[name]!.version}${latest}`);
      }
      return 0;
    }
    default:
      return fail(`unknown command: ${command}`);
  }
}

function fail(message: string): number {
  console.error(`error: ${message}\n`);
  console.error(HELP);
  return 1;
}

main(process.argv.slice(2))
  .then((code) => process.exit(code))
  .catch((err: unknown) => {
    console.error(`error: ${(err as Error).message}`);
    process.exit(1);
  });
