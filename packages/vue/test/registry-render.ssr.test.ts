import { relative } from "node:path";
import { fileURLToPath } from "node:url";
import { renderToString } from "@vue/server-renderer";
import { createSSRApp, type Component } from "vue";
import { describe, expect, it } from "vitest";
import { registryFiles } from "../../lint/src/registry.ts";

/**
 * Every `.vue` file the registry ships, compiled by `@vitejs/plugin-vue` and
 * then actually rendered.
 *
 * Compiling is not the bar. `SignUp.vue` shipped a `withDefaults(…)` whose
 * result was never bound to `props` and then read `props.highlights` in a
 * `computed`: `compileScript` has no opinion about free identifiers, so the
 * file compiled clean and threw `ReferenceError: props is not defined` the
 * first time the screen painted. Nothing caught it, because until this suite
 * nothing in CI had ever *run* a registry SFC — only read it as text
 * (`moderno-lint --registry`) or, from the sibling `registry-sfc` suite,
 * compiled it.
 *
 * Rendering catches that whole class: a `setup()` that reads something which
 * isn't there. The screens are mounted with no props at all, which is the state
 * a consumer sees on their first paste — every prop is optional by design, so a
 * bare mount is a legitimate render and not a contrived one.
 *
 * `Solid` and `Svelte` have the same gate in their own SSR projects.
 */

const manifest = fileURLToPath(new URL("../../../registry/registry.json", import.meta.url));
const root = fileURLToPath(new URL("../../../", import.meta.url));

const sfcs = registryFiles(manifest)
  .filter((file) => file.path.endsWith(".vue"))
  .map((file) => ({ item: file.item, path: file.path, label: relative(root, file.path) }));

describe("registry Vue SFCs render", () => {
  it("ships at least one Vue item, so an empty set cannot pass this gate", () => {
    expect(sfcs.length).toBeGreaterThan(0);
  });

  /**
   * The generous timeout is the transform, not the render: the dynamic import
   * compiles this file and every primitive it reaches, and under a full
   * `vitest run` that cost lands inside the first test rather than in
   * collection. The renders themselves are milliseconds.
   */
  it.each(sfcs)(
    "$label ($item)",
    async ({ path, label }) => {
      const module = (await import(/* @vite-ignore */ path)) as { default?: Component };
      expect(module.default, `${label} has no default export to mount`).toBeTruthy();
      await expect(renderToString(createSSRApp(module.default as Component))).resolves.toBeTypeOf(
        "string",
      );
    },
    30_000,
  );
});
