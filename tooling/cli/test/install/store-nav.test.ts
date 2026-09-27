import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { registryDir, useFreshProject } from "./fresh-project.ts";

const project = useFreshProject();

describe("moderno add store-nav-<framework>", () => {
  /** Blocks are authored in all four frameworks, one registry item each. */
  const variants = [
    { item: "store-nav-react", target: "src/components/blocks/store-nav.tsx" },
    { item: "store-nav-vue", target: "src/components/blocks/StoreNav.vue" },
    { item: "store-nav-svelte", target: "src/components/blocks/StoreNav.svelte" },
    { item: "store-nav-solid", target: "src/components/blocks/store-nav.tsx" },
  ];

  for (const { item, target } of variants) {
    it(`installs ${item} into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({ registry, projectDir: project(), name: item, manifest });

      expect(result.installed).toEqual([item]);

      const written = await readFile(join(project(), target), "utf8");
      // Composed from the primitives the registry entry advertises: a Menu for
      // a category with sub-categories, a Combobox for the search, a Drawer
      // holding the categories on narrow containers and a Button to open it,
      // the cart Button with its count in a Badge, an Alert with a retry when
      // the categories fail and Skeleton placeholders while they load…
      for (const primitive of [
        "Alert",
        "Badge",
        "Button",
        "Combobox",
        "Drawer",
        "Menu",
        "Skeleton",
      ]) {
        expect(written).toContain(primitive);
      }
      // …the brand linking home, the categories, the search and the cart…
      expect(written).toContain("<header");
      expect(written).toMatch(/<nav[^>]* aria-label="Categories"/);
      expect(written).toContain("aria-current");
      expect(written).toContain('role="search"');
      expect(written).toContain("Search products");
      expect(written).toContain("No suggestions. Press Enter to search.");
      expect(written).toContain("Cart, ");
      expect(written).toContain('placement="right"');
      // …laid out from its container rather than the viewport, one decision per
      // contract step (ADR-0005): more room at the ends, then the categories in
      // place of the Drawer button, then the search in the bar…
      expect(written).toContain("@container");
      expect(written).toContain("@sm:px-6");
      expect(written).toContain("@md:hidden");
      expect(written).toContain("@md:flex");
      expect(written).toContain("@lg:flex-1");
      expect(written).not.toContain("@media");
      // …and carrying its own loading and error renders.
      expect(written).toContain("aria-busy");
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
