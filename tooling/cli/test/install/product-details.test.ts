import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { registryDir, useFreshProject } from "./fresh-project.ts";

const project = useFreshProject();

describe("moderno add product-details-<framework>", () => {
  /** Blocks are authored in all four frameworks, one registry item each. */
  const variants = [
    { item: "product-details-react", target: "src/components/blocks/product-details.tsx" },
    { item: "product-details-vue", target: "src/components/blocks/ProductDetails.vue" },
    { item: "product-details-svelte", target: "src/components/blocks/ProductDetails.svelte" },
    { item: "product-details-solid", target: "src/components/blocks/product-details.tsx" },
  ];

  for (const { item, target } of variants) {
    it(`installs ${item} into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({ registry, projectDir: project(), name: item, manifest });

      expect(result.installed).toEqual([item]);

      const written = await readFile(join(project(), target), "utf8");
      // Composed from the primitives the registry entry advertises: a Carousel
      // for the gallery, a RadioGroup per option, a NumberInput for the
      // quantity, a Button (with a Spinner while adding) to add it, Tabs for the
      // details, an Alert with a Button when it fails and Skeleton placeholders
      // while loading…
      for (const primitive of [
        "Alert",
        "Button",
        "Carousel",
        "NumberInput",
        "RadioGroup",
        "Skeleton",
        "Spinner",
        "Tabs",
      ]) {
        expect(written).toContain(primitive);
      }
      // …the photos, each option's sold-out values, a whole-number quantity,
      // Add to cart with its adding and sold-out renders…
      expect(written).toContain("<img");
      expect(written).toContain("Sold out");
      expect(written).toContain("Number.isInteger(quantity)");
      expect(written).toContain("maximumFractionDigits: 0");
      expect(written).toMatch(/formatOptions|format-options/);
      expect(written).toContain("Add to cart");
      expect(written).toContain("Adding");
      expect(written).toContain("aria-busy");
      // …laid out from its container rather than the viewport, one decision per
      // contract step (ADR-0005): the quantity beside the button, a larger
      // name, then the gallery beside the details…
      expect(written).toContain("@container");
      expect(written).toContain("@sm:flex");
      expect(written).toContain("@md:text-heading");
      expect(written).toContain("@lg:grid-cols-2");
      expect(written).not.toContain("@media");
      // …and carrying its own loading, empty and error renders.
      expect(written).toContain("Loading the product");
      expect(written).toContain("This product is no longer available.");
      expect(written).toContain("Try again");

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
      expect(entry.version).toBe("0.1.0");
      // It draws no icons and every primitive arrives with the framework
      // package, so `add` copies exactly one file and installs nothing else.
      expect(entry.dependencies).toEqual([`@moderno-ui/${item.split("-").pop()}`]);
      expect(entry.registryDependencies ?? []).toEqual([]);
      expect(entry.files).toHaveLength(1);
    }
  });
});
