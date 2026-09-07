#!/usr/bin/env node
/**
 * Copy the repo `registry/` into `public/r/` so the same deploy that serves the
 * MDX docs also serves `/r/registry.json` and `/r/{type}/{name}.json`. The CLI
 * (`@moderno-ui/cli`) can then point at the production URL — or a per-PR preview
 * URL — as its registry source. Static copy keeps the registry a plain file
 * tree with no server.
 *
 * The copy is also the publication gate: this deploy is what `moderno add`
 * reads, so a registry whose items break the tier rules (a block composing a
 * flow, a dependency cycle, an unknown type) must never reach `/r/`. Validate
 * with the CLI's own rules — the same ones the registry integrity test runs —
 * so the docs build fails before a consumer's install does.
 */
import { checkTiers, type Registry } from "@moderno-ui/cli";
import { cpSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = resolve(fileURLToPath(import.meta.url), "..");
const src = resolve(here, "../../../registry");
const dest = resolve(here, "../public/r");

const registry = JSON.parse(readFileSync(join(src, "registry.json"), "utf8")) as Registry;
const violations = checkTiers(registry.items);

if (violations.length > 0) {
  console.error("✗ registry not publishable — tier rules broken:");
  for (const violation of violations) console.error(`  ${violation.message}`);
  process.exit(1);
}

rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });
cpSync(src, dest, { recursive: true });

const tiers = new Map<string, number>();
for (const item of registry.items) tiers.set(item.type, (tiers.get(item.type) ?? 0) + 1);
const summary = [...tiers]
  .map(([type, count]) => `${count} ${type.replace("registry:", "")}`)
  .join(", ");

console.log(`✓ copied registry/ → public/r/ (${summary})`);
