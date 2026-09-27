import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { registryDir, useFreshProject } from "./fresh-project.ts";

const project = useFreshProject();

describe("moderno add incentive-strip-<framework>", () => {
  /** Blocks are authored in all four frameworks, one registry item each. */
  const variants = [
    { item: "incentive-strip-react", target: "src/components/blocks/incentive-strip.tsx" },
    { item: "incentive-strip-vue", target: "src/components/blocks/IncentiveStrip.vue" },
    { item: "incentive-strip-svelte", target: "src/components/blocks/IncentiveStrip.svelte" },
    { item: "incentive-strip-solid", target: "src/components/blocks/incentive-strip.tsx" },
  ];

  for (const { item, target } of variants) {
    it(`installs ${item} into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({ registry, projectDir: project(), name: item, manifest });

      expect(result.installed).toEqual([item]);

      const written = await readFile(join(project(), target), "utf8");
      // Composed from the primitives the registry entry advertises: an Alert
      // with a retry Button when the incentives fail to load and Skeleton
      // placeholders while they load…
      for (const primitive of ["Alert", "Button", "Skeleton"]) {
        expect(written).toContain(primitive);
      }
      // …each incentive an item of one list, with its icon drawn inline and
      // hidden from assistive technology, and an optional policy link that the
      // disabled state takes out of reach…
      expect(written).toContain("<ul");
      expect(written).toContain("<li");
      expect(written).toContain("<svg");
      expect(written).toContain('aria-hidden="true"');
      expect(written).toContain("aria-disabled");
      expect(written).toContain("font-serif");
      // …laid out from its container rather than the viewport, one decision per
      // contract step (ADR-0005): two per row with the icon above its text, a
      // larger heading, then all four on one row with more room above and below…
      expect(written).toContain("@container");
      expect(written).toContain("@sm:grid-cols-2");
      expect(written).toContain("@sm:flex-col");
      expect(written).toContain("@md:text-heading");
      expect(written).toContain("@lg:grid-cols-4");
      expect(written).toContain("@lg:py-16");
      expect(written).not.toContain("@media");
      // …and carrying its own loading, empty and error renders.
      expect(written).toContain("aria-busy");
      expect(written).toContain("No incentives to show yet.");
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
      // Its icons are drawn inline and every primitive arrives with the
      // framework package, so `add` copies exactly one file and installs
      // nothing else.
      expect(entry.dependencies).toEqual([`@moderno-ui/${item.split("-").pop()}`]);
      expect(entry.registryDependencies ?? []).toEqual([]);
      expect(entry.files).toHaveLength(1);
    }
  });
});
