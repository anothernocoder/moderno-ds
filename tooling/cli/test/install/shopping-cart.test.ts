import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { registryDir, useFreshProject } from "./fresh-project.ts";

const project = useFreshProject();

describe("moderno add shopping-cart-<framework>", () => {
  /** Blocks are authored in all four frameworks, one registry item each. */
  const variants = [
    { item: "shopping-cart-react", target: "src/components/blocks/shopping-cart.tsx" },
    { item: "shopping-cart-vue", target: "src/components/blocks/ShoppingCart.vue" },
    { item: "shopping-cart-svelte", target: "src/components/blocks/ShoppingCart.svelte" },
    { item: "shopping-cart-solid", target: "src/components/blocks/shopping-cart.tsx" },
  ];

  for (const { item, target } of variants) {
    it(`installs ${item} into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({ registry, projectDir: project(), name: item, manifest });

      expect(result.installed).toEqual([item]);

      const written = await readFile(join(project(), target), "utf8");
      // Composed from the primitives the registry entry advertises: a
      // NumberInput for each line's quantity and a Button to remove it, a Card
      // for the order summary, an Alert with a Button when it fails and
      // Skeleton placeholders while loading…
      for (const primitive of ["Alert", "Button", "Card", "NumberInput", "Skeleton"]) {
        expect(written).toContain(primitive);
      }
      // …each line's image, its name as a link that goes inert when disabled,
      // its quantity from 1, a Remove button and a Checkout button…
      expect(written).toContain("<img");
      expect(written).toContain("href");
      expect(written).toContain("aria-disabled");
      expect(written).toContain("Quantity, ");
      expect(written).toContain("Remove");
      expect(written).toContain("Checkout");
      expect(written).toContain("Subtotal");
      // …laid out from its container rather than the viewport, one decision per
      // contract step (ADR-0005): a larger image with the quantity beside it,
      // then a larger image again, then the summary beside the lines…
      expect(written).toContain("@container");
      expect(written).toContain("@sm:size-24");
      expect(written).toContain("@md:size-32");
      expect(written).toContain("@lg:grid-cols-3");
      expect(written).not.toContain("@media");
      // …and carrying its own loading, empty and error renders.
      expect(written).toContain("aria-busy");
      expect(written).toContain("Your cart is empty.");
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
