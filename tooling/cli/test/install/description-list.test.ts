import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { registryDir, useFreshProject } from "./fresh-project.ts";

const project = useFreshProject();

describe("moderno add description-list-<framework>", () => {
  /** Blocks are authored in all four frameworks, one registry item each. */
  const variants = [
    { item: "description-list-react", target: "src/components/blocks/description-list.tsx" },
    { item: "description-list-vue", target: "src/components/blocks/DescriptionList.vue" },
    { item: "description-list-svelte", target: "src/components/blocks/DescriptionList.svelte" },
    { item: "description-list-solid", target: "src/components/blocks/description-list.tsx" },
  ];

  for (const { item, target } of variants) {
    it(`installs ${item} into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({ registry, projectDir: project(), name: item, manifest });

      expect(result.installed).toEqual([item]);

      const written = await readFile(join(project(), target), "utf8");
      // Composed from the primitives the registry entry advertises: a Divider
      // under the header, a Badge for a status value and a Button per row action…
      for (const primitive of ["Divider", "Badge", "Button", "Card", "Skeleton", "Alert"]) {
        expect(written).toContain(primitive);
      }
      // …as a real description list: one term and one value per row…
      for (const tag of ["<dl", "<dt", "<dd"]) expect(written).toContain(tag);
      // …laid out from its container rather than the viewport, one decision per
      // contract step (ADR-0005): the row action beside its value, the term
      // beside its value, then a narrower term column…
      expect(written).toContain("@container");
      expect(written).toContain("@sm:flex");
      expect(written).toContain("@md:grid-cols-3");
      expect(written).toContain("@lg:grid-cols-4");
      expect(written).not.toContain("@media");
      // …and carrying its own loading and empty renders.
      expect(written).toContain("aria-busy");
      expect(written).toContain("No details yet");

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
