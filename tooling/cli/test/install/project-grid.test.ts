import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { registryDir, useFreshProject } from "./fresh-project.ts";

const project = useFreshProject();

describe("moderno add project-grid-<framework>", () => {
  /** Blocks are authored in all four frameworks, one registry item each. */
  const variants = [
    { item: "project-grid-react", target: "src/components/blocks/project-grid.tsx" },
    { item: "project-grid-vue", target: "src/components/blocks/ProjectGrid.vue" },
    { item: "project-grid-svelte", target: "src/components/blocks/ProjectGrid.svelte" },
    { item: "project-grid-solid", target: "src/components/blocks/project-grid.tsx" },
  ];

  for (const { item, target } of variants) {
    it(`installs ${item} into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({ registry, projectDir: project(), name: item, manifest });

      expect(result.installed).toEqual([item]);

      const written = await readFile(join(project(), target), "utf8");
      // Composed from the primitives the registry entry advertises: a Card per
      // project with its tags as Badges, an Alert with a Button when it fails
      // and Skeleton placeholders while loading…
      for (const primitive of ["Alert", "Badge", "Button", "Card", "Skeleton"]) {
        expect(written).toContain(primitive);
      }
      // …a cover that holds the consumer's image, each project's year as a
      // machine-readable <time>, and its title as a link that goes inert when
      // disabled…
      expect(written).toContain("aspect-video");
      expect(written).toContain("<img");
      expect(written).toContain("<time");
      expect(written).toContain("href");
      expect(written).toContain("aria-disabled");
      expect(written).toContain("View all projects");
      // …the heading in the theme's display face…
      expect(written).toContain("font-serif");
      // …laid out from its container rather than the viewport, one decision per
      // contract step (ADR-0005): the link to every project beside the heading,
      // then two columns and a larger heading, then three columns with more
      // room…
      expect(written).toContain("@container");
      expect(written).toContain("@sm:flex");
      expect(written).toContain("@md:grid-cols-2");
      expect(written).toContain("@md:text-heading");
      expect(written).toContain("@lg:grid-cols-3");
      expect(written).toContain("@lg:py-16");
      expect(written).not.toContain("@media");
      // …and carrying its own loading, empty and error renders.
      expect(written).toContain("aria-busy");
      expect(written).toContain("No projects to show yet.");
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
