import { relative } from "node:path";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement, type ComponentType } from "react";
import { describe, expect, it } from "vitest";
import { registryFiles } from "../../lint/src/registry.ts";

/**
 * Every React file the registry ships, compiled and then actually rendered.
 *
 * The other three frameworks have had this gate since the Vue screens shipped a
 * file that compiled clean and threw the first time it painted
 * (`packages/vue/test/registry-render.ssr.test.ts`). React had none: its
 * registry sources sit outside every `tsconfig` in the repo and outside every
 * suite, so until this file the only thing CI ever did with
 * `registry/**\/react/*.tsx` was read it as text. A block, a screen and now a
 * flow are the three tiers a consumer copies; none of them should be able to
 * reach npm without having been run once.
 *
 * Mounted with no props at all: every prop is optional by design, so a bare
 * mount is the state a consumer sees on their first paste. Each file is
 * expected to export exactly one component, named for the item.
 */

const manifest = fileURLToPath(new URL("../../../registry/registry.json", import.meta.url));
const root = fileURLToPath(new URL("../../../", import.meta.url));

const sources = registryFiles(manifest)
  .filter((file) => /\/react\/[^/]+\.tsx$/.test(file.path))
  .map((file) => ({ item: file.item, path: file.path, label: relative(root, file.path) }));

/** The exported component of a registry module: the one export that is a function. */
function componentOf(module: Record<string, unknown>): ComponentType | undefined {
  const exported = Object.values(module).filter(
    (value): value is ComponentType => typeof value === "function",
  );
  return exported.length === 1 ? exported[0] : undefined;
}

describe("registry React components render", () => {
  it("ships at least one React item, so an empty set cannot pass this gate", () => {
    expect(sources.length).toBeGreaterThan(0);
  });

  it.each(sources)(
    "$label ($item)",
    async ({ path, label }) => {
      const module = (await import(/* @vite-ignore */ path)) as Record<string, unknown>;
      const component = componentOf(module);
      expect(component, `${label} exports no single component to mount`).toBeTruthy();
      expect(renderToStaticMarkup(createElement(component!))).toBeTypeOf("string");
    },
    30_000,
  );
});
