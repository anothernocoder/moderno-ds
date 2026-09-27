import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { registryDir, useFreshProject } from "./fresh-project.ts";

const project = useFreshProject();

describe("moderno add container-<framework>", () => {
  /** Blocks are authored in all four frameworks, one registry item each. */
  const variants = [
    { item: "container-react", target: "src/components/blocks/container.tsx" },
    { item: "container-vue", target: "src/components/blocks/Container.vue" },
    { item: "container-svelte", target: "src/components/blocks/Container.svelte" },
    { item: "container-solid", target: "src/components/blocks/container.tsx" },
  ];

  for (const { item, target } of variants) {
    it(`installs ${item} into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({ registry, projectDir: project(), name: item, manifest });

      expect(result.installed).toEqual([item]);

      const written = await readFile(join(project(), target), "utf8");
      // Its sample content is the Card primitive, so the block renders on its own…
      expect(written).toContain("Card.Root");
      // …it caps its width at the contract's container step its `size` names,
      // and `full` names none…
      expect(written).toContain("data-size");
      for (const step of ["sm", "md", "lg"]) {
        expect(written).toContain(`data-[size=${step}]:max-w-${step}`);
      }
      expect(written).not.toContain("size=full");
      // …and its gutter responds to its container rather than the viewport,
      // on all three contract steps (ADR-0005).
      expect(written).toContain("@container");
      expect(written).toContain("@sm:px-6");
      expect(written).toContain("@md:px-8");
      expect(written).toContain("@lg:py-10");
      expect(written).not.toContain("@media");

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
      // The primitive comes from the framework package; the block draws no
      // icon, so no icon package is installed and `add` copies one file.
      expect(entry.dependencies).toEqual([`@moderno-ui/${item.split("-").pop()}`]);
      expect(entry.registryDependencies ?? []).toEqual([]);
      expect(entry.files).toHaveLength(1);
    }
  });
});
