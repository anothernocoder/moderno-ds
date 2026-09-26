import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { registryDir, useFreshProject } from "./fresh-project.ts";

const project = useFreshProject();

describe("moderno add cta-<framework>", () => {
  /** Blocks are authored in all four frameworks, one registry item each. */
  const variants = [
    { item: "cta-react", target: "src/components/blocks/cta.tsx" },
    { item: "cta-vue", target: "src/components/blocks/Cta.vue" },
    { item: "cta-svelte", target: "src/components/blocks/Cta.svelte" },
    { item: "cta-solid", target: "src/components/blocks/cta.tsx" },
  ];

  for (const { item, target } of variants) {
    it(`installs ${item} into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({ registry, projectDir: project(), name: item, manifest });

      expect(result.installed).toEqual([item]);

      const written = await readFile(join(project(), target), "utf8");
      // Composed from the primitives the registry entry advertises: a primary
      // and an outline Button, an Alert when it fails and Skeleton placeholders
      // while loading…
      for (const primitive of ["Alert", "Button", "Skeleton"]) {
        expect(written).toContain(primitive);
      }
      expect(written).toContain('variant="outline"');
      // …with the title in the theme's display face, on a card panel…
      expect(written).toContain("font-serif");
      expect(written).toContain("bg-card");
      // …laid out from its container rather than the viewport, one decision per
      // contract step (ADR-0005): the actions side by side, a larger title, then
      // the text and the actions in one row…
      expect(written).toContain("@container");
      expect(written).toContain("@sm:flex");
      expect(written).toContain("@md:text-heading");
      expect(written).toContain("@lg:justify-between");
      expect(written).not.toContain("@media");
      // …and carrying its own loading and error renders.
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
      expect(entry.version).toBe("0.1.0");
      // No icons, so no icon package: every primitive arrives with the
      // framework package, and `add` copies exactly one file.
      expect(entry.dependencies).toEqual([`@moderno-ui/${item.split("-").pop()}`]);
      expect(entry.registryDependencies ?? []).toEqual([]);
      expect(entry.files).toHaveLength(1);
    }
  });
});
