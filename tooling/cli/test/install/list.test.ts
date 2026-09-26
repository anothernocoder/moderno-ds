import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { registryDir, useFreshProject } from "./fresh-project.ts";

const project = useFreshProject();

describe("moderno add list-<framework>", () => {
  /** Blocks are authored in all four frameworks, one registry item each. */
  const variants = [
    { item: "list-react", target: "src/components/blocks/list.tsx" },
    { item: "list-vue", target: "src/components/blocks/List.vue" },
    { item: "list-svelte", target: "src/components/blocks/List.svelte" },
    { item: "list-solid", target: "src/components/blocks/list.tsx" },
  ];

  for (const { item, target } of variants) {
    it(`installs ${item} into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({ registry, projectDir: project(), name: item, manifest });

      expect(result.installed).toEqual([item]);

      const written = await readFile(join(project(), target), "utf8");
      // Composed from the primitives the registry entry advertises: rows in a
      // Card, each with an Avatar, a status Badge and its own Buttons…
      for (const primitive of ["Card", "Avatar", "Badge", "Button", "Skeleton", "Alert"]) {
        expect(written).toContain(primitive);
      }
      // …laid out from its container rather than the viewport, one decision per
      // contract step (ADR-0005): buttons at the row's end, a status column,
      // then the facts lined up…
      expect(written).toContain("@container");
      expect(written).toContain("@sm:col-start-3");
      expect(written).toContain("@md:col-start-4");
      expect(written).toContain("@lg:w-28");
      expect(written).not.toContain("@media");
      // …carrying its own loading and empty renders, and naming every row
      // action after its record.
      expect(written).toContain("aria-busy");
      expect(written).toContain("No members yet");
      expect(written).toContain("`Edit ${item.title}`");
      expect(written).toContain("`Remove ${item.title}`");

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
