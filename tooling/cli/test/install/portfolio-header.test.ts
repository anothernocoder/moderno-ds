import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { registryDir, useFreshProject } from "./fresh-project.ts";

const project = useFreshProject();

describe("moderno add portfolio-header-<framework>", () => {
  /** Blocks are authored in all four frameworks, one registry item each. */
  const variants = [
    { item: "portfolio-header-react", target: "src/components/blocks/portfolio-header.tsx" },
    { item: "portfolio-header-vue", target: "src/components/blocks/PortfolioHeader.vue" },
    { item: "portfolio-header-svelte", target: "src/components/blocks/PortfolioHeader.svelte" },
    { item: "portfolio-header-solid", target: "src/components/blocks/portfolio-header.tsx" },
  ];

  for (const { item, target } of variants) {
    it(`installs ${item} into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({ registry, projectDir: project(), name: item, manifest });

      expect(result.installed).toEqual([item]);

      const written = await readFile(join(project(), target), "utf8");
      // Composed from the primitives the registry entry advertises: an Avatar
      // for the person, an Indicator for their availability, an Alert with a
      // Button when it fails and Skeleton placeholders while loading…
      for (const primitive of ["Alert", "Avatar", "Button", "Indicator", "Skeleton"]) {
        expect(written).toContain(primitive);
      }
      // …the person's name as the page's h1 in the theme's display face, and
      // their links in a named nav, each going inert when disabled…
      expect(written).toContain("<h1");
      expect(written).toContain("font-serif");
      expect(written).toContain('aria-label="Links"');
      expect(written).toContain("href");
      expect(written).toContain("aria-disabled");
      // …laid out from its container rather than the viewport, one decision per
      // contract step (ADR-0005): a larger bio, then a larger name with the
      // avatar beside the text, then more room…
      expect(written).toContain("@container");
      expect(written).toContain("@sm:text-body-lg");
      expect(written).toContain("@md:text-heading-lg");
      expect(written).toContain("@md:flex-row");
      expect(written).toContain("@lg:py-20");
      expect(written).not.toContain("@media");
      // …and carrying its own loading and error renders.
      expect(written).toContain("aria-busy");
      expect(written).toContain("Loading the profile…");
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
