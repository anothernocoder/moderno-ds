import { relative } from "node:path";
import { fileURLToPath } from "node:url";
import { render } from "svelte/server";
import type { Component } from "svelte";
import { describe, expect, it } from "vitest";
import { registryFiles } from "../../lint/src/registry.ts";

/**
 * Every `.svelte` file the registry ships, compiled by `plugin-svelte` and then
 * actually rendered.
 *
 * The Vue half of this gate exists because four Vue items shipped without ever
 * being compiled and a fifth without ever being run (see
 * `packages/vue/test/registry-render.ssr.test.ts`). Svelte was luckier rather
 * than better guarded: the docs mount the Svelte copies, so its screens got
 * exercised by accident, through pages that happen to preview them. That is not
 * a gate — it holds only for as long as every registry item has a preview page
 * — so the Svelte sources get the same explicit check, driven by the manifest
 * instead of by whatever the docs happen to import.
 *
 * Mounted with no props at all: every prop is optional by design, so a bare
 * mount is the state a consumer sees on their first paste.
 */

const manifest = fileURLToPath(new URL("../../../registry/registry.json", import.meta.url));
const root = fileURLToPath(new URL("../../../", import.meta.url));

const components = registryFiles(manifest)
  .filter((file) => file.path.endsWith(".svelte"))
  .map((file) => ({ item: file.item, path: file.path, label: relative(root, file.path) }));

describe("registry Svelte components render", () => {
  it("ships at least one Svelte item, so an empty set cannot pass this gate", () => {
    expect(components.length).toBeGreaterThan(0);
  });

  /**
   * The generous timeout is the transform, not the render: the dynamic import
   * compiles this file and every primitive it reaches, and under a full
   * `vitest run` that cost lands inside the first test rather than in
   * collection. The renders themselves are milliseconds.
   */
  it.each(components)(
    "$label ($item)",
    async ({ path, label }) => {
      const module = (await import(/* @vite-ignore */ path)) as { default?: Component };
      expect(module.default, `${label} has no default export to mount`).toBeTruthy();
      expect(render(module.default as Component).body).toBeTypeOf("string");
    },
    30_000,
  );
});
