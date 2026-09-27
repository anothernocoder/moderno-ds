import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { registryDir, useFreshProject } from "./fresh-project.ts";

const project = useFreshProject();

describe("moderno add long-form-content-<framework>", () => {
  /** Blocks are authored in all four frameworks, one registry item each. */
  const variants = [
    { item: "long-form-content-react", target: "src/components/blocks/long-form-content.tsx" },
    { item: "long-form-content-vue", target: "src/components/blocks/LongFormContent.vue" },
    { item: "long-form-content-svelte", target: "src/components/blocks/LongFormContent.svelte" },
    { item: "long-form-content-solid", target: "src/components/blocks/long-form-content.tsx" },
  ];

  for (const { item, target } of variants) {
    it(`installs ${item} into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({ registry, projectDir: project(), name: item, manifest });

      expect(result.installed).toEqual([item]);

      const written = await readFile(join(project(), target), "utf8");
      // Composed from the primitives the registry entry advertises: an Avatar
      // for the quoted person, an outline Button for the call to action, an
      // Alert when it fails and Skeleton placeholders while loading…
      for (const primitive of ["Alert", "Avatar", "Button", "Skeleton"]) {
        expect(written).toContain(primitive);
      }
      expect(written).toContain('variant="outline"');
      // …a case study on the contract type scale: the project's facts in a
      // description list, the story in sections, and a pull-quote in the
      // theme's display face in a figure…
      expect(written).toContain("font-serif");
      expect(written).toContain("text-body");
      expect(written).toContain("<dl");
      expect(written).toContain("<blockquote");
      expect(written).toContain("<figcaption");
      expect(written).toContain("max-w-lg");
      // …laid out from its container rather than the viewport, one decision per
      // contract step (ADR-0005): a larger lead, a larger heading and quote with
      // the facts in one row, then the facts beside the story…
      expect(written).toContain("@container");
      expect(written).toContain("@sm:text-body-lg");
      expect(written).toContain("@md:text-heading");
      expect(written).toContain("@md:text-heading-sm");
      expect(written).toContain("@md:grid-cols-4");
      expect(written).toContain("@lg:grid-cols-3");
      expect(written).toContain("@lg:py-20");
      expect(written).not.toContain("@media");
      // …and carrying its own loading, empty and error renders.
      expect(written).toContain("aria-busy");
      expect(written).toContain("This case study has no story yet.");
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
