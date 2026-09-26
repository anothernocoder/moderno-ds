import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { registryDir, useFreshProject } from "./fresh-project.ts";

const project = useFreshProject();

describe("moderno add activity-feed-<framework>", () => {
  /** Blocks are authored in all four frameworks, one registry item each. */
  const variants = [
    { item: "activity-feed-react", target: "src/components/blocks/activity-feed.tsx" },
    { item: "activity-feed-vue", target: "src/components/blocks/ActivityFeed.vue" },
    { item: "activity-feed-svelte", target: "src/components/blocks/ActivityFeed.svelte" },
    { item: "activity-feed-solid", target: "src/components/blocks/activity-feed.tsx" },
  ];

  for (const { item, target } of variants) {
    it(`installs ${item} into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({ registry, projectDir: project(), name: item, manifest });

      expect(result.installed).toEqual([item]);

      const written = await readFile(join(project(), target), "utf8");
      // Composed from the primitives the registry entry advertises…
      for (const primitive of ["Avatar", "Button", "Card", "Alert", "Skeleton"]) {
        expect(written).toContain(primitive);
      }
      // …an ordered timeline whose rows carry a machine-readable time…
      expect(written).toContain("<ol");
      expect(written).toContain("<time");
      // …responsive to its container rather than the viewport, one layout
      // decision per contract step (ADR-0005)…
      expect(written).toContain("@container");
      expect(written).toContain("@sm:");
      expect(written).toContain("@md:");
      expect(written).toContain("@lg:");
      expect(written).not.toContain("@media");
      // …and carrying the states the block advertises: a busy region while the
      // feed loads, and an empty render of its own.
      expect(written).toContain("aria-busy");
      expect(written).toContain("No activity yet");

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
      expect(entry.dependencies).toEqual([`@moderno-ui/${item.split("-").pop()}`]);
      // No icons are drawn, so no icon package is installed; the primitives
      // come with the framework package, so `add` copies exactly one file.
      expect(entry.registryDependencies ?? []).toEqual([]);
      expect(entry.files).toHaveLength(1);
    }
  });
});
