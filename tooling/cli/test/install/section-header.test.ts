import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { registryDir, useFreshProject } from "./fresh-project.ts";

const project = useFreshProject();

describe("moderno add section-header-<framework>", () => {
  /** Blocks are authored in all four frameworks, one registry item each. */
  const variants = [
    { item: "section-header-react", target: "src/components/blocks/section-header.tsx" },
    { item: "section-header-vue", target: "src/components/blocks/SectionHeader.vue" },
    { item: "section-header-svelte", target: "src/components/blocks/SectionHeader.svelte" },
    { item: "section-header-solid", target: "src/components/blocks/section-header.tsx" },
  ];

  for (const { item, target } of variants) {
    it(`installs ${item} into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({ registry, projectDir: project(), name: item, manifest });

      expect(result.installed).toEqual([item]);

      const written = await readFile(join(project(), target), "utf8");
      // Composed from the primitives the registry entry advertises…
      for (const primitive of ["Alert", "Badge", "Button", "Card", "Skeleton"]) {
        expect(written).toContain(primitive);
      }
      // …one header in three variants, each at its own rank in the outline…
      for (const tag of ['page: "h1"', 'section: "h2"', 'card: "h3"']) {
        expect(written).toContain(tag);
      }
      // …responsive to its container rather than the viewport, and using all
      // three contract steps (ADR-0005) — the actions beside the heading, then
      // two larger heading steps…
      expect(written).toContain("@container");
      expect(written).toContain("@sm:flex");
      expect(written).toContain("@md:text-heading");
      expect(written).toContain("@lg:text-heading-lg");
      expect(written).not.toContain("@media");
      // …a breadcrumb trail that names the current page…
      expect(written).toContain('aria-label="Breadcrumb"');
      expect(written).toContain('"page"');
      // …and the states it advertises: a busy region while loading, and a
      // retry when the details failed.
      expect(written).toContain("aria-busy");
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
      // The primitives come from the framework package; the block draws no
      // icon, so no icon package is installed and `add` copies one file.
      expect(entry.dependencies).toEqual([`@moderno-ui/${item.split("-").pop()}`]);
      expect(entry.registryDependencies ?? []).toEqual([]);
      expect(entry.files).toHaveLength(1);
    }
  });
});
