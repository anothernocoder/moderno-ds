import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { registryDir, useFreshProject } from "./fresh-project.ts";

const project = useFreshProject();

describe("moderno add reviews-<framework>", () => {
  /** Blocks are authored in all four frameworks, one registry item each. */
  const variants = [
    { item: "reviews-react", target: "src/components/blocks/reviews.tsx" },
    { item: "reviews-vue", target: "src/components/blocks/Reviews.vue" },
    { item: "reviews-svelte", target: "src/components/blocks/Reviews.svelte" },
    { item: "reviews-solid", target: "src/components/blocks/reviews.tsx" },
  ];

  for (const { item, target } of variants) {
    it(`installs ${item} into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({ registry, projectDir: project(), name: item, manifest });

      expect(result.installed).toEqual([item]);

      const written = await readFile(join(project(), target), "utf8");
      // Composed from the primitives the registry entry advertises: a Progress
      // bar per star rating, a Card per review with the author's Avatar and a
      // Badge, a Button to write one, an Alert with a retry when it fails and
      // Skeleton placeholders while loading…
      for (const primitive of [
        "Alert",
        "Avatar",
        "Badge",
        "Button",
        "Card",
        "Progress",
        "Skeleton",
      ]) {
        expect(written).toContain(primitive);
      }
      // …the stars drawn inline so no icon package is needed, and read out as
      // one rating…
      expect(written).toContain('stroke="currentColor"');
      expect(written).toContain("out of 5 stars");
      expect(written).toContain("Write a review");
      // …the heading in the theme's display face…
      expect(written).toContain("font-serif");
      // …laid out from its container rather than the viewport, one decision per
      // contract step (ADR-0005): larger reviews, then the average beside the
      // bars and a larger heading, then the summary in a column beside the
      // reviews with more room…
      expect(written).toContain("@container");
      expect(written).toContain("@sm:text-body");
      expect(written).toContain("@md:grid-cols-2");
      expect(written).toContain("@md:text-heading");
      expect(written).toContain("@lg:grid-cols-3");
      expect(written).toContain("@lg:col-span-2");
      expect(written).toContain("@lg:py-16");
      expect(written).not.toContain("@media");
      // …and carrying its own loading, empty and error renders.
      expect(written).toContain("aria-busy");
      expect(written).toContain("No reviews yet.");
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
      // The stars are inline SVG and every primitive arrives with the framework
      // package, so `add` copies exactly one file and installs nothing else.
      expect(entry.dependencies).toEqual([`@moderno-ui/${item.split("-").pop()}`]);
      expect(entry.registryDependencies ?? []).toEqual([]);
      expect(entry.files).toHaveLength(1);
    }
  });
});
