#!/usr/bin/env node
/**
 * Copy the repo `registry/` into `public/r/` so the same deploy that serves the
 * MDX docs also serves `/r/registry.json` and `/r/{type}/{name}.json`. The CLI
 * (`@moderno/cli`) can then point at the production URL — or a per-PR preview
 * URL — as its registry source. Static copy keeps the registry a plain file
 * tree with no server.
 */
import { cpSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = resolve(fileURLToPath(import.meta.url), "..");
const src = resolve(here, "../../../registry");
const dest = resolve(here, "../public/r");

rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });
cpSync(src, dest, { recursive: true });

console.log(`✓ copied registry/ → public/r/`);
