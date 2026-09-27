import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { registryDir, useFreshProject } from "./fresh-project.ts";

const project = useFreshProject();

describe("moderno add header-<framework>", () => {
  /** Blocks are authored in all four frameworks, one registry item each. */
  const variants = [
    { item: "header-react", target: "src/components/blocks/header.tsx" },
    { item: "header-vue", target: "src/components/blocks/Header.vue" },
    { item: "header-svelte", target: "src/components/blocks/Header.svelte" },
    { item: "header-solid", target: "src/components/blocks/header.tsx" },
  ];

  for (const { item, target } of variants) {
    it(`installs ${item} into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({ registry, projectDir: project(), name: item, manifest });

      expect(result.installed).toEqual([item]);

      const written = await readFile(join(project(), target), "utf8");
      // Composed from the primitives the registry entry advertises: a Menu for
      // a group of links, a Drawer holding the navigation on narrow containers
      // and a Button to open it, the call to action, an Alert with a retry when
      // the navigation fails and Skeleton placeholders while it loads…
      for (const primitive of ["Alert", "Button", "Drawer", "Menu", "Skeleton"]) {
        expect(written).toContain(primitive);
      }
      // …the brand linking home, the main navigation and one call to action…
      expect(written).toContain("<header");
      expect(written).toMatch(/<nav[^>]* aria-label="Main"/);
      expect(written).toContain("aria-current");
      expect(written).toContain('placement="right"');
      expect(written).toContain("Get started");
      // …laid out from its container rather than the viewport, one decision per
      // contract step (ADR-0005): the call to action in the bar, then the links
      // in place of the Drawer button, then more room…
      expect(written).toContain("@container");
      expect(written).toContain("hidden @sm:inline-flex");
      expect(written).toContain("@md:hidden");
      expect(written).toContain("@md:flex");
      expect(written).toContain("@lg:px-8");
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
