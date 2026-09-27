import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { registryDir, useFreshProject } from "./fresh-project.ts";

const project = useFreshProject();

describe("moderno add media-object-<framework>", () => {
  /** Blocks are authored in all four frameworks, one registry item each. */
  const variants = [
    { item: "media-object-react", target: "src/components/blocks/media-object.tsx" },
    { item: "media-object-vue", target: "src/components/blocks/MediaObject.vue" },
    { item: "media-object-svelte", target: "src/components/blocks/MediaObject.svelte" },
    { item: "media-object-solid", target: "src/components/blocks/media-object.tsx" },
  ];

  for (const { item, target } of variants) {
    it(`installs ${item} into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({ registry, projectDir: project(), name: item, manifest });

      expect(result.installed).toEqual([item]);

      const written = await readFile(join(project(), target), "utf8");
      // Composed from the primitives the registry entry advertises: an Avatar
      // beside the text and one Button for its action…
      for (const primitive of ["Avatar", "Button", "Skeleton", "Alert"]) {
        expect(written).toContain(primitive);
      }
      // …with the avatar at the start or the end…
      expect(written).toContain('"end"');
      expect(written).toContain("@sm:data-[media-position=end]:flex-row-reverse");
      // …laid out from its container rather than the viewport, one decision per
      // contract step (ADR-0005): the avatar beside the text, a larger heading
      // and body, then the meta on the heading's far edge…
      expect(written).toContain("@container");
      expect(written).toContain("@sm:flex-row");
      expect(written).toContain("@md:text-body-lg");
      expect(written).toContain("@lg:justify-between");
      expect(written).not.toContain("@media");
      // …and carrying its own loading and empty renders.
      expect(written).toContain("aria-busy");
      expect(written).toContain("Nothing written yet.");

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
      // No icons, so no icon package: every primitive arrives with the
      // framework package, and `add` copies exactly one file.
      expect(entry.dependencies).toEqual([`@moderno-ui/${item.split("-").pop()}`]);
      expect(entry.registryDependencies ?? []).toEqual([]);
      expect(entry.files).toHaveLength(1);
    }
  });
});
