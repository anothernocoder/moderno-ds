import { relative } from "node:path";
import { fileURLToPath } from "node:url";
import { renderToString } from "solid-js/web";
import type { Component } from "solid-js";
import { describe, expect, it } from "vitest";
import { registryFiles } from "../../lint/src/registry.ts";

/**
 * Every Solid file the registry ships, compiled by `vite-plugin-solid` and then
 * actually rendered.
 *
 * The Vue half of this gate exists because four Vue items shipped without ever
 * being compiled and a fifth without ever being run (see
 * `packages/vue/test/registry-render.ssr.test.ts`). Solid was the least covered
 * of the three ports — its sources are `.tsx` but sit outside every `tsconfig`,
 * and unlike Svelte the docs never mount them — so until this suite nothing in
 * CI compiled or ran them at all.
 *
 * A Solid file exports its component by name rather than by default, so the
 * gate mounts every exported function. Mounted with no props at all: every prop
 * is optional by design, so a bare mount is the state a consumer sees on their
 * first paste.
 */

const manifest = fileURLToPath(new URL("../../../registry/registry.json", import.meta.url));
const root = fileURLToPath(new URL("../../../", import.meta.url));

const components = registryFiles(manifest)
  .filter((file) => file.item.endsWith("-solid") && file.path.endsWith(".tsx"))
  .map((file) => ({ item: file.item, path: file.path, label: relative(root, file.path) }));

describe("registry Solid components render", () => {
  it("ships at least one Solid item, so an empty set cannot pass this gate", () => {
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
      const module = (await import(/* @vite-ignore */ path)) as Record<string, unknown>;
      const exported = Object.entries(module).filter(([, value]) => typeof value === "function");
      expect(exported.length, `${label} exports no component to mount`).toBeGreaterThan(0);
      for (const [name, component] of exported) {
        expect(
          renderToString(() => (component as Component)({})),
          `${label} failed to render its ${name} export`,
        ).toBeTypeOf("string");
      }
    },
    30_000,
  );
});
