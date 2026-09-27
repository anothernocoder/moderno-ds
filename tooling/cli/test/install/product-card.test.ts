import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { registryDir, useFreshProject } from "./fresh-project.ts";

const project = useFreshProject();

describe("moderno add product-card-<framework>", () => {
  /** Blocks are authored in all four frameworks, one registry item each. */
  const variants = [
    { item: "product-card-react", target: "src/components/blocks/product-card.tsx" },
    { item: "product-card-vue", target: "src/components/blocks/ProductCard.vue" },
    { item: "product-card-svelte", target: "src/components/blocks/ProductCard.svelte" },
    { item: "product-card-solid", target: "src/components/blocks/product-card.tsx" },
  ];

  for (const { item, target } of variants) {
    it(`installs ${item} into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({ registry, projectDir: project(), name: item, manifest });

      expect(result.installed).toEqual([item]);

      const written = await readFile(join(project(), target), "utf8");
      // Composed from the primitives the registry entry advertises: a Card with
      // a Badge on the image and a Button to add it to the cart, an Alert with a
      // Button when it fails and Skeleton placeholders while loading…
      for (const primitive of ["Alert", "Badge", "Button", "Card", "Skeleton"]) {
        expect(written).toContain(primitive);
      }
      // …the product's image, its name as a link that goes inert when
      // disabled, and the old price struck through on a sale…
      expect(written).toContain("<img");
      expect(written).toContain("href");
      expect(written).toContain("aria-disabled");
      expect(written).toContain("<s ");
      expect(written).toContain("Add to cart");
      // …laid out from its container rather than the viewport, one decision per
      // contract step (ADR-0005): the image beside the text, then a larger
      // name, then an even split with a square image…
      expect(written).toContain("@container");
      expect(written).toContain("@sm:grid-cols-5");
      expect(written).toContain("@md:text-heading-sm");
      expect(written).toContain("@lg:grid-cols-2");
      expect(written).toContain("@lg:aspect-square");
      expect(written).not.toContain("@media");
      // …and carrying its own loading, empty and error renders.
      expect(written).toContain("aria-busy");
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
