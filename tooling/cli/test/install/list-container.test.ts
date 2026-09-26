import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { registryDir, useFreshProject } from "./fresh-project.ts";

const project = useFreshProject();

describe("moderno add list-container-<framework>", () => {
  /** Blocks are authored in all four frameworks, one registry item each. */
  const variants = [
    { item: "list-container-react", target: "src/components/blocks/list-container.tsx" },
    { item: "list-container-vue", target: "src/components/blocks/ListContainer.vue" },
    { item: "list-container-svelte", target: "src/components/blocks/ListContainer.svelte" },
    { item: "list-container-solid", target: "src/components/blocks/list-container.tsx" },
  ];

  for (const { item, target } of variants) {
    it(`installs ${item} into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({ registry, projectDir: project(), name: item, manifest });

      expect(result.installed).toEqual([item]);

      const written = await readFile(join(project(), target), "utf8");
      // Composed from the primitives the registry entry advertises…
      for (const primitive of ["Alert", "Avatar", "Badge", "Button", "Card", "Skeleton"]) {
        expect(written).toContain(primitive);
      }
      // …a body that scrolls between a fixed header and footer, reachable by
      // keyboard so the rows it hides can be scrolled into view…
      expect(written).toContain("overflow-y-auto");
      expect(written).toMatch(/tab[iI]ndex/);
      // …responsive to its container rather than the viewport, and using all
      // three contract steps (ADR-0005) — a trailing column, side by side, aligned times…
      expect(written).toContain("@container");
      expect(written).toContain("@sm:col-start-3");
      expect(written).toContain("@md:flex-row");
      expect(written).toContain("@lg:text-right");
      expect(written).not.toContain("@media");
      // …and carrying the states the block advertises: a busy region while
      // the rows load, and an empty render of its own.
      expect(written).toContain("aria-busy");
      expect(written).toContain("No tasks yet");

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
      // The primitives come from the framework package; the block draws no
      // icon, so no icon package is installed and `add` copies one file.
      expect(entry.dependencies).toEqual([`@moderno-ui/${item.split("-").pop()}`]);
      expect(entry.registryDependencies ?? []).toEqual([]);
      expect(entry.files).toHaveLength(1);
    }
  });
});
