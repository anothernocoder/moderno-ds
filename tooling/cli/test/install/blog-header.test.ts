import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { registryDir, useFreshProject } from "./fresh-project.ts";

const project = useFreshProject();

describe("moderno add blog-header-<framework>", () => {
  /** Blocks are authored in all four frameworks, one registry item each. */
  const variants = [
    { item: "blog-header-react", target: "src/components/blocks/blog-header.tsx" },
    { item: "blog-header-vue", target: "src/components/blocks/BlogHeader.vue" },
    { item: "blog-header-svelte", target: "src/components/blocks/BlogHeader.svelte" },
    { item: "blog-header-solid", target: "src/components/blocks/blog-header.tsx" },
  ];

  for (const { item, target } of variants) {
    it(`installs ${item} into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({ registry, projectDir: project(), name: item, manifest });

      expect(result.installed).toEqual([item]);

      const written = await readFile(join(project(), target), "utf8");
      // Composed from the primitives the registry entry advertises: a Chip per
      // category, an Alert with a Button when they fail and Skeleton
      // placeholders while loading…
      for (const primitive of ["Alert", "Button", "Chip", "Skeleton"]) {
        expect(written).toContain(primitive);
      }
      // …the title as the page's heading, in the theme's display face…
      expect(written).toContain("<h1");
      expect(written).toContain("font-serif");
      // …each category a link in a named nav, the current one marked, and
      // every link inert when disabled…
      expect(written).toContain('aria-label="Categories"');
      expect(written).toContain("href");
      expect(written).toContain("aria-current");
      expect(written).toContain("aria-disabled");
      // …laid out from its container rather than the viewport, one decision per
      // contract step (ADR-0005): a larger description, then a larger title and
      // more room between the chips, then more room around the header…
      expect(written).toContain("@container");
      expect(written).toContain("@sm:text-body");
      expect(written).toContain("@md:text-heading-lg");
      expect(written).toContain("@md:gap-3");
      expect(written).toContain("@lg:py-16");
      expect(written).not.toContain("@media");
      // …and carrying its own loading, empty and error renders.
      expect(written).toContain("aria-busy");
      expect(written).toContain("No categories yet.");
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
