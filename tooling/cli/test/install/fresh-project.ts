/**
 * Shared by the install suites in this folder — one file per block, screen and
 * flow — which run `moderno add <item>` against the **real** catalog, into a
 * temp project.
 *
 * `tiers-install.test.ts` proves the composition rules on a synthetic fixture;
 * these prove the thing a consumer actually types works on the registry this
 * repo ships — that the manifest's paths point at files that exist, that each
 * file lands at the target its item declares, and that what arrives is the item
 * as authored rather than a stale copy. An item whose registry entry and source
 * drift apart fails here rather than in someone's project.
 *
 * Per tier, what is held is the promise that tier's docs page makes: a block is
 * one file; a screen puts itself *and* its blocks on disk, each recorded under
 * its own version, and imports them from where they landed; a flow resolves two
 * levels of composition at once, with one copy of a block every screen imports.
 */
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach } from "vitest";

export const registryDir = fileURLToPath(new URL("../../../../registry", import.meta.url));

/** A link handing its destination back: `onNavigate?.(…)`, or Vue's `emit('navigate', …)`. */
export const NAVIGATE_CALL =
  /on[Nn]avigate\?\.\([^)]*\)|emit\("navigate"[^)]*\)|emit\('navigate'[^)]*\)/g;

/** A fresh, empty consumer project for each test in the file, removed after it. */
export function useFreshProject(): () => string {
  let project: string;

  beforeEach(async () => {
    project = await mkdtemp(join(tmpdir(), "moderno-proj-"));
  });

  afterEach(async () => {
    await rm(project, { recursive: true, force: true });
  });

  return () => project;
}
