import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { registryDir, useFreshProject } from "./fresh-project.ts";

const project = useFreshProject();

describe("moderno add product-list-<framework>", () => {
  /** Blocks are authored in all four frameworks, one registry item each. */
  const variants = [
    { item: "product-list-react", target: "src/components/blocks/product-list.tsx" },
    { item: "product-list-vue", target: "src/components/blocks/ProductList.vue" },
    { item: "product-list-svelte", target: "src/components/blocks/ProductList.svelte" },
    { item: "product-list-solid", target: "src/components/blocks/product-list.tsx" },
  ];

  for (const { item, target } of variants) {
    it(`installs ${item} into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({ registry, projectDir: project(), name: item, manifest });

      expect(result.installed).toEqual([item]);

      const written = await readFile(join(project(), target), "utf8");
      // Composed from the primitives the registry entry advertises: a Badge on
      // a product, Pagination under the grid, an Alert with a Button when it
      // fails and Skeleton placeholders while loading…
      for (const primitive of ["Alert", "Badge", "Button", "Pagination", "Skeleton"]) {
        expect(written).toContain(primitive);
      }
      // …each product's name as a link that goes inert when disabled, and its
      // old price struck through…
      expect(written).toContain("<h3");
      expect(written).toContain("href");
      expect(written).toContain("aria-disabled");
      expect(written).toContain("<s ");
      // …the heading in the theme's display face…
      expect(written).toContain("font-serif");
      // …laid out from its container rather than the viewport, one decision per
      // contract step (ADR-0005): two columns at first, the product count
      // beside the heading, then three columns and a larger heading, then four
      // columns with more room…
      expect(written).toContain("@container");
      expect(written).toContain("grid-cols-2");
      expect(written).toContain("@sm:flex");
      expect(written).toContain("@md:grid-cols-3");
      expect(written).toContain("@md:text-heading");
      expect(written).toContain("@lg:grid-cols-4");
      expect(written).toContain("@lg:py-16");
      expect(written).not.toContain("@media");
      // …and carrying its own loading, empty and error renders.
      expect(written).toContain("aria-busy");
      expect(written).toContain("No products match yet.");
      expect(written).toContain("Try again");

      const recorded = await readManifest(project());
      expect(recorded.items[item]!.version).toBe(registry.getItem(item)!.version);
      expect(recorded.items[item]!.type).toBe("registry:block");
      expect(recorded.items[item]!.files[0]!.target).toBe(target);
    });
  }

  it("declares the framework package it composes and pulls in no extra items", async () => {
    const registry = await createRegistry(registryDir).load();
    for (const { item } of variants) {
      const entry = registry.getItem(item)!;
      expect(entry.type).toBe("registry:block");
      expect(entry.version).toBe("0.1.0");
      // It draws no icons (the page arrows are text glyphs) and every
      // primitive arrives with the framework package, so `add` copies exactly
      // one file and installs nothing else.
      expect(entry.dependencies).toEqual([`@moderno-ui/${item.split("-").pop()}`]);
      expect(entry.registryDependencies ?? []).toEqual([]);
      expect(entry.files).toHaveLength(1);
    }
  });
});
