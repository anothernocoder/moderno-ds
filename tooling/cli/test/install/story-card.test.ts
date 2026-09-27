import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { registryDir, useFreshProject } from "./fresh-project.ts";

const project = useFreshProject();

describe("moderno add story-card-<framework>", () => {
  /** Blocks are authored in all four frameworks, one registry item each. */
  const variants = [
    { item: "story-card-react", target: "src/components/blocks/story-card.tsx" },
    { item: "story-card-vue", target: "src/components/blocks/StoryCard.vue" },
    { item: "story-card-svelte", target: "src/components/blocks/StoryCard.svelte" },
    { item: "story-card-solid", target: "src/components/blocks/story-card.tsx" },
  ];

  for (const { item, target } of variants) {
    it(`installs ${item} into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({ registry, projectDir: project(), name: item, manifest });

      expect(result.installed).toEqual([item]);

      const written = await readFile(join(project(), target), "utf8");
      // Composed from the primitives the registry entry advertises: a Card
      // with the brand's Avatar and a Badge, a Button for the action, an Alert
      // with a Button when it fails and Skeleton placeholders while loading…
      for (const primitive of ["Alert", "Avatar", "Badge", "Button", "Card", "Skeleton"]) {
        expect(written).toContain(primitive);
      }
      // …a 9:16 frame holding the optional image, the title in the display
      // face and one full-width action…
      expect(written).toContain("aspect-9/16");
      expect(written).toContain("<img");
      expect(written).toContain("font-serif");
      expect(written).toContain("Shop now");
      // …laid out from its container rather than the viewport, one decision per
      // contract step (ADR-0005): a larger title and detail, then more room
      // inside the card, then room around it…
      expect(written).toContain("@container");
      expect(written).toContain("@sm:text-heading-lg");
      expect(written).toContain("@md:p-10");
      expect(written).toContain("@lg:py-16");
      expect(written).not.toContain("@media");
      // …and carrying its own loading, empty and error renders.
      expect(written).toContain("aria-busy");
      expect(written).toContain("This story has nothing to show yet.");
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
