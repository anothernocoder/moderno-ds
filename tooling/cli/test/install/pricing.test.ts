import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { registryDir, useFreshProject } from "./fresh-project.ts";

const project = useFreshProject();

describe("moderno add pricing-<framework>", () => {
  /** Blocks are authored in all four frameworks, one registry item each. */
  const variants = [
    { item: "pricing-react", target: "src/components/blocks/pricing.tsx" },
    { item: "pricing-vue", target: "src/components/blocks/Pricing.vue" },
    { item: "pricing-svelte", target: "src/components/blocks/Pricing.svelte" },
    { item: "pricing-solid", target: "src/components/blocks/pricing.tsx" },
  ];

  for (const { item, target } of variants) {
    it(`installs ${item} into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({ registry, projectDir: project(), name: item, manifest });

      expect(result.installed).toEqual([item]);

      const written = await readFile(join(project(), target), "utf8");
      // Composed from the primitives the registry entry advertises: a Card per
      // plan, a Badge on the recommended one, a primary and an outline Button,
      // an Alert when it fails and Skeleton placeholders while loading…
      for (const primitive of ["Card", "Badge", "Button", "Alert", "Skeleton"]) {
        expect(written).toContain(primitive);
      }
      // …the recommended plan outlined in the contract's --primary…
      expect(written).toContain("border-primary");
      // …laid out from its container rather than the viewport, one decision per
      // contract step (ADR-0005): features in two columns, the plans side by
      // side and a larger title, then more room…
      expect(written).toContain("@container");
      expect(written).toContain("@sm:grid-cols-2");
      expect(written).toContain("@md:grid-flow-col");
      expect(written).toContain("@md:text-heading-lg");
      expect(written).toContain("@lg:py-16");
      expect(written).not.toContain("@media");
      // …and carrying its own loading, empty and error renders.
      expect(written).toContain("aria-busy");
      expect(written).toContain("No plans to show yet");
      expect(written).toContain("Try again");
      // A screen that mounts it as the whole route can make its title the h1.
      expect(written).toContain("titleLevel");
      expect(written).toContain("aria-level");

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
      expect(entry.version).toBe("0.4.0");
      // The check glyph is inline SVG on currentColor, so no icon package:
      // every primitive arrives with the framework package, and `add` copies
      // exactly one file.
      expect(entry.dependencies).toEqual([`@moderno-ui/${item.split("-").pop()}`]);
      expect(entry.registryDependencies ?? []).toEqual([]);
      expect(entry.files).toHaveLength(1);
    }
  });
});
