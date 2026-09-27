import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { registryDir, useFreshProject } from "./fresh-project.ts";

const project = useFreshProject();

describe("moderno add footer-<framework>", () => {
  /** Blocks are authored in all four frameworks, one registry item each. */
  const variants = [
    { item: "footer-react", target: "src/components/blocks/footer.tsx" },
    { item: "footer-vue", target: "src/components/blocks/Footer.vue" },
    { item: "footer-svelte", target: "src/components/blocks/Footer.svelte" },
    { item: "footer-solid", target: "src/components/blocks/footer.tsx" },
  ];

  for (const { item, target } of variants) {
    it(`installs ${item} into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({ registry, projectDir: project(), name: item, manifest });

      expect(result.installed).toEqual([item]);

      const written = await readFile(join(project(), target), "utf8");
      // Composed from the primitives the registry entry advertises: an outline
      // Button for the brand's action, a Divider over the bottom row, an Alert
      // when the links fail and Skeleton placeholders while they load…
      for (const primitive of ["Alert", "Button", "Divider", "Skeleton"]) {
        expect(written).toContain(primitive);
      }
      expect(written).toContain('variant="outline"');
      // …as a footer landmark with a labelled navigation, legal links and
      // social links whose marks are drawn inline on currentColor…
      expect(written).toContain("<footer");
      expect(written).toContain('aria-label="Footer"');
      expect(written).toContain('aria-label="Legal"');
      expect(written).toContain('aria-label="Social"');
      expect(written).toContain('fill="currentColor"');
      // …the brand in the theme's display face…
      expect(written).toContain("font-serif");
      // …laid out from its container rather than the viewport, one decision per
      // contract step (ADR-0005): three link columns, the bottom row on one
      // line, then the brand beside the columns with more room above and below…
      expect(written).toContain("@container");
      expect(written).toContain("@sm:grid-cols-3");
      expect(written).toContain("@md:justify-between");
      expect(written).toContain("@lg:grid-cols-3");
      expect(written).toContain("@lg:py-16");
      expect(written).not.toContain("@media");
      // …and carrying its own loading and error renders.
      expect(written).toContain("aria-busy");
      expect(written).toContain("Loading links…");
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
      // The social marks are inline SVG and every primitive arrives with the
      // framework package, so `add` copies exactly one file and installs
      // nothing else.
      expect(entry.dependencies).toEqual([`@moderno-ui/${item.split("-").pop()}`]);
      expect(entry.registryDependencies ?? []).toEqual([]);
      expect(entry.files).toHaveLength(1);
    }
  });
});
