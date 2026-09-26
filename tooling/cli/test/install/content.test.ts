import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { registryDir, useFreshProject } from "./fresh-project.ts";

const project = useFreshProject();

describe("moderno add content-<framework>", () => {
  /** Blocks are authored in all four frameworks, one registry item each. */
  const variants = [
    { item: "content-react", target: "src/components/blocks/content.tsx" },
    { item: "content-vue", target: "src/components/blocks/Content.vue" },
    { item: "content-svelte", target: "src/components/blocks/Content.svelte" },
    { item: "content-solid", target: "src/components/blocks/content.tsx" },
  ];

  for (const { item, target } of variants) {
    it(`installs ${item} into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({ registry, projectDir: project(), name: item, manifest });

      expect(result.installed).toEqual([item]);

      const written = await readFile(join(project(), target), "utf8");
      // Composed from the primitives the registry entry advertises: an outline
      // Button for the call to action, an Alert when it fails and Skeleton
      // placeholders while loading…
      for (const primitive of ["Alert", "Button", "Skeleton"]) {
        expect(written).toContain(primitive);
      }
      expect(written).toContain('variant="outline"');
      // …prose on the contract type scale, in one reading column, with the
      // heading in the theme's display face and the quote in a figure…
      expect(written).toContain("font-serif");
      expect(written).toContain("text-body");
      expect(written).toContain("max-w-md");
      expect(written).toContain("<blockquote");
      expect(written).toContain("<figcaption");
      // …laid out from its container rather than the viewport, one decision per
      // contract step (ADR-0005): a larger lead, a larger heading, then more
      // room above and below…
      expect(written).toContain("@container");
      expect(written).toContain("@sm:text-body-lg");
      expect(written).toContain("@md:text-heading");
      expect(written).toContain("@lg:py-16");
      expect(written).not.toContain("@media");
      // …and carrying its own loading, empty and error renders.
      expect(written).toContain("aria-busy");
      expect(written).toContain("Nothing to read here yet.");
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
      // No icons, and every primitive arrives with the framework package, so
      // `add` copies exactly one file and installs nothing else.
      expect(entry.dependencies).toEqual([`@moderno-ui/${item.split("-").pop()}`]);
      expect(entry.registryDependencies ?? []).toEqual([]);
      expect(entry.files).toHaveLength(1);
    }
  });
});
