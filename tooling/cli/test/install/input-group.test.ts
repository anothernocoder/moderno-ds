import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { registryDir, useFreshProject } from "./fresh-project.ts";

const project = useFreshProject();

describe("moderno add input-group-<framework>", () => {
  /** Blocks are authored in all four frameworks, one registry item each. */
  const variants = [
    { item: "input-group-react", target: "src/components/blocks/input-group.tsx" },
    { item: "input-group-vue", target: "src/components/blocks/InputGroup.vue" },
    { item: "input-group-svelte", target: "src/components/blocks/InputGroup.svelte" },
    { item: "input-group-solid", target: "src/components/blocks/input-group.tsx" },
  ];

  for (const { item, target } of variants) {
    it(`installs ${item} into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({ registry, projectDir: project(), name: item, manifest });

      expect(result.installed).toEqual([item]);

      const written = await readFile(join(project(), target), "utf8");
      // Composed from the primitives the registry entry advertises: Field for
      // every input, Button for Copy and Search, Spinner while searching…
      for (const primitive of ["Field", "Button", "Spinner"]) {
        expect(written).toContain(primitive);
      }
      // …each input joined to its add-ons, which turn red with it…
      for (const addOn of ["https://", "USD", "Copy", "Search"]) {
        expect(written).toContain(addOn);
      }
      expect(written).toContain("in-data-invalid:border-destructive");
      // …laid out from its container rather than the viewport, one decision
      // per contract step (ADR-0005): the groups two-up, then the heading
      // beside them…
      expect(written).toContain("@container");
      expect(written).toContain("@md:grid-cols-2");
      expect(written).toContain("@lg:grid-cols-3");
      expect(written).not.toContain("@media");
      // …and carrying its own loading and empty renders.
      expect(written).toContain("aria-busy");
      expect(written).toContain("No key yet");

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
