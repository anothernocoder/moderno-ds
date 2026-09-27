import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { registryDir, useFreshProject } from "./fresh-project.ts";

const project = useFreshProject();

describe("moderno add app-banner-<framework>", () => {
  /** Blocks are authored in all four frameworks, one registry item each. */
  const variants = [
    { item: "app-banner-react", target: "src/components/blocks/app-banner.tsx" },
    { item: "app-banner-vue", target: "src/components/blocks/AppBanner.vue" },
    { item: "app-banner-svelte", target: "src/components/blocks/AppBanner.svelte" },
    { item: "app-banner-solid", target: "src/components/blocks/app-banner.tsx" },
  ];

  for (const { item, target } of variants) {
    it(`installs ${item} into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({ registry, projectDir: project(), name: item, manifest });

      expect(result.installed).toEqual([item]);

      const written = await readFile(join(project(), target), "utf8");
      // Composed from the primitives the registry entry advertises: an Alert per
      // banner with its action and dismiss Buttons, a Skeleton while loading…
      for (const primitive of ["Alert", "Button", "Skeleton"]) {
        expect(written).toContain(primitive);
      }
      // …with the three kinds it ships, each tinted by an Alert status…
      for (const kind of ['"impersonation"', '"trial"', '"incident"']) {
        expect(written).toContain(kind);
      }
      expect(written).toContain('"warning"');
      expect(written).toContain('"info"');
      expect(written).toContain('"error"');
      // …laid out from its container rather than the viewport, one decision per
      // contract step (ADR-0005): actions beside the message, title and
      // description on one line, then the dismiss label…
      expect(written).toContain("@container");
      expect(written).toContain("@sm:flex");
      expect(written).toContain("@md:inline");
      expect(written).toContain("@lg:inline");
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
      // Its icons are inline SVG, so no icon package: every primitive arrives
      // with the framework package, and `add` copies exactly one file.
      expect(entry.dependencies).toEqual([`@moderno-ui/${item.split("-").pop()}`]);
      expect(entry.registryDependencies ?? []).toEqual([]);
      expect(entry.files).toHaveLength(1);
    }
  });
});
