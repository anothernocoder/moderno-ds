import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { registryDir, useFreshProject } from "./fresh-project.ts";

const project = useFreshProject();

describe("moderno add layers-panel-<framework>", () => {
  /** Blocks are authored in all four frameworks, one registry item each. */
  const variants = [
    { item: "layers-panel-react", target: "src/components/blocks/layers-panel.tsx" },
    { item: "layers-panel-vue", target: "src/components/blocks/LayersPanel.vue" },
    { item: "layers-panel-svelte", target: "src/components/blocks/LayersPanel.svelte" },
    { item: "layers-panel-solid", target: "src/components/blocks/layers-panel.tsx" },
  ];

  for (const { item, target } of variants) {
    it(`installs ${item} into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({ registry, projectDir: project(), name: item, manifest });

      expect(result.installed).toEqual([item]);

      const written = await readFile(join(project(), target), "utf8");
      // Composed from the primitives the registry entry advertises: a
      // SortableList for the order, Toggles for visibility and lock, a Menu
      // for the row's actions, Editable to rename, a Tooltip for a long name
      // and Buttons to add…
      for (const primitive of ["SortableList", "Toggle", "Menu", "Editable", "Tooltip", "Button"]) {
        expect(written).toContain(primitive);
      }
      // …the list named, each row's name button its trigger…
      expect(written).toMatch(/aria-label="Layers"/);
      expect(written).toContain("SortableList.ItemTrigger");
      // …the menu's three actions and the empty state's action…
      for (const action of ["Duplicate", "Rename", "Delete", "Add layer", "No layers yet"]) {
        expect(written).toContain(action);
      }
      // …the toggles named for what they do…
      expect(written).toMatch(/Hide.*Show|'Hide' : 'Show'/);
      expect(written).toMatch(/Unlock.*Lock|'Unlock' : 'Lock'/);
      // …laid out from its container rather than the viewport (ADR-0005).
      expect(written).toContain("@container");
      expect(written).toContain("@sm:size-8");
      expect(written).not.toContain("@media");

      const recorded = await readManifest(project());
      expect(recorded.items[item]!.version).toBe(registry.getItem(item)!.version);
      expect(recorded.items[item]!.type).toBe("registry:block");
      expect(recorded.items[item]!.files[0]!.target).toBe(target);
    });
  }

  it("declares the package it imports and pulls in no extra items", async () => {
    const registry = await createRegistry(registryDir).load();
    for (const { item } of variants) {
      const entry = registry.getItem(item)!;
      expect(entry.type).toBe("registry:block");
      // No icon package: the icons are inline SVG, so every primitive arrives
      // with the framework package, and `add` copies exactly one file.
      expect(entry.dependencies).toEqual([`@moderno-ui/${item.split("-").pop()}`]);
      expect(entry.registryDependencies ?? []).toEqual([]);
      expect(entry.files).toHaveLength(1);
    }
  });
});
