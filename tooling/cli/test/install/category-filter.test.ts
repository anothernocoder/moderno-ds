import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { registryDir, useFreshProject } from "./fresh-project.ts";

const project = useFreshProject();

describe("moderno add category-filter-<framework>", () => {
  /** Blocks are authored in all four frameworks, one registry item each. */
  const variants = [
    { item: "category-filter-react", target: "src/components/blocks/category-filter.tsx" },
    { item: "category-filter-vue", target: "src/components/blocks/CategoryFilter.vue" },
    { item: "category-filter-svelte", target: "src/components/blocks/CategoryFilter.svelte" },
    { item: "category-filter-solid", target: "src/components/blocks/category-filter.tsx" },
  ];

  for (const { item, target } of variants) {
    it(`installs ${item} into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({ registry, projectDir: project(), name: item, manifest });

      expect(result.installed).toEqual([item]);

      const written = await readFile(join(project(), target), "utf8");
      // Composed from the primitives the registry entry advertises: an
      // Accordion of facets, a Checkbox per option, a price Slider, a Drawer
      // for narrow containers, Buttons, an Alert and Skeleton placeholders…
      for (const primitive of [
        "Accordion",
        "Checkbox",
        "Slider",
        "Drawer",
        "Button",
        "Alert",
        "Skeleton",
      ]) {
        expect(written).toContain(primitive);
      }
      // …the drawer sliding in from the left, with Clear all and Show results…
      expect(written).toContain('placement="left"');
      expect(written).toContain("Clear all");
      expect(written).toContain("Show results");
      // …laid out from its container rather than the viewport, one decision per
      // contract step (ADR-0005): the sidebar replaces the drawer's button at @md…
      expect(written).toContain("@container");
      expect(written).toContain("@sm:flex");
      expect(written).toContain("@md:hidden");
      expect(written).toContain("@md:grid");
      expect(written).toContain("@md:text-heading");
      expect(written).toContain("@lg:w-60");
      expect(written).not.toContain("@media");
      // …and carrying its own loading, empty and error renders.
      expect(written).toContain("aria-busy");
      expect(written).toContain("No filters for this category.");
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
      // No icon package: the chevron is an inline SVG and the close button a
      // "×" glyph, so every primitive arrives with the framework package and
      // `add` copies exactly one file.
      expect(entry.dependencies).toEqual([`@moderno-ui/${item.split("-").pop()}`]);
      expect(entry.registryDependencies ?? []).toEqual([]);
      expect(entry.files).toHaveLength(1);
    }
  });
});
