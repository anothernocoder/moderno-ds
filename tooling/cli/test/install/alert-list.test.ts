import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { registryDir, useFreshProject } from "./fresh-project.ts";

const project = useFreshProject();

describe("moderno add alert-list-<framework>", () => {
  /** Blocks are authored in all four frameworks, one registry item each. */
  const variants = [
    { item: "alert-list-react", target: "src/components/blocks/alert-list.tsx" },
    { item: "alert-list-vue", target: "src/components/blocks/AlertList.vue" },
    { item: "alert-list-svelte", target: "src/components/blocks/AlertList.svelte" },
    { item: "alert-list-solid", target: "src/components/blocks/alert-list.tsx" },
  ];

  for (const { item, target } of variants) {
    it(`installs ${item} into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({ registry, projectDir: project(), name: item, manifest });

      expect(result.installed).toEqual([item]);

      const written = await readFile(join(project(), target), "utf8");
      // Composed from the primitives the registry entry advertises…
      expect(written).toContain("Alert");
      expect(written).toContain("Button");
      expect(written).toContain("Card");
      // …in all four status variants, which is what makes it a list rather
      // than a repeated banner…
      for (const variant of ["info", "success", "warning", "error"]) {
        expect(written).toContain(`"${variant}"`);
      }
      // …responsive to its container rather than the viewport, and using all
      // three contract steps (ADR-0005) — one layout decision each…
      expect(written).toContain("@container");
      expect(written).toContain("@sm:");
      expect(written).toContain("@md:");
      expect(written).toContain("@lg:");
      expect(written).not.toContain("@media");
      // …and carrying the states the block advertises: a busy region while the
      // list loads, and an empty render of its own.
      expect(written).toContain("aria-busy");
      expect(written).toContain("caught up");

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
      // The status glyphs are inline SVG stroking currentColor, not an icon
      // package, so nothing beyond the framework package is installed and
      // nothing is ejected alongside: `add` copies exactly one file.
      expect(entry.registryDependencies ?? []).toEqual([]);
      expect(entry.files).toHaveLength(1);
    }
  });
});
