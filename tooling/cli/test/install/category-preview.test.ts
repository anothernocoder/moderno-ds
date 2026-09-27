import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { registryDir, useFreshProject } from "./fresh-project.ts";

const project = useFreshProject();

describe("moderno add category-preview-<framework>", () => {
  /** Blocks are authored in all four frameworks, one registry item each. */
  const variants = [
    { item: "category-preview-react", target: "src/components/blocks/category-preview.tsx" },
    { item: "category-preview-vue", target: "src/components/blocks/CategoryPreview.vue" },
    { item: "category-preview-svelte", target: "src/components/blocks/CategoryPreview.svelte" },
    { item: "category-preview-solid", target: "src/components/blocks/category-preview.tsx" },
  ];

  for (const { item, target } of variants) {
    it(`installs ${item} into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({ registry, projectDir: project(), name: item, manifest });

      expect(result.installed).toEqual([item]);

      const written = await readFile(join(project(), target), "utf8");
      // Composed from the primitives the registry entry advertises: a Card per
      // category, an Alert with a Button when it fails and Skeleton
      // placeholders while loading…
      for (const primitive of ["Alert", "Button", "Card", "Skeleton"]) {
        expect(written).toContain(primitive);
      }
      // …each tile's picture, or its initial when there is none, and its name
      // as a link that covers the whole tile and goes inert when disabled…
      expect(written).toContain("<img");
      expect(written).toContain("charAt(0)");
      expect(written).toContain("after:inset-0");
      expect(written).toContain("aria-disabled");
      expect(written).toContain("Browse all categories");
      // …the heading in the theme's display face…
      expect(written).toContain("font-serif");
      // …laid out from its container rather than the viewport, one decision per
      // contract step (ADR-0005): two columns and the link to every category
      // beside the heading, then a larger heading, then four columns with
      // more room…
      expect(written).toContain("@container");
      expect(written).toContain("@sm:flex");
      expect(written).toContain("@sm:grid-cols-2");
      expect(written).toContain("@md:text-heading");
      expect(written).toContain("@lg:grid-cols-4");
      expect(written).toContain("@lg:py-16");
      expect(written).not.toContain("@media");
      // …and carrying its own loading, empty and error renders.
      expect(written).toContain("aria-busy");
      expect(written).toContain("No categories to show yet.");
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
      // It draws no icons and every primitive arrives with the framework
      // package, so `add` copies exactly one file and installs nothing else.
      expect(entry.dependencies).toEqual([`@moderno-ui/${item.split("-").pop()}`]);
      expect(entry.registryDependencies ?? []).toEqual([]);
      expect(entry.files).toHaveLength(1);
    }
  });
});
