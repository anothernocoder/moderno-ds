import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { registryDir, useFreshProject } from "./fresh-project.ts";

const project = useFreshProject();

describe("moderno add faq-<framework>", () => {
  /** Blocks are authored in all four frameworks, one registry item each. */
  const variants = [
    { item: "faq-react", target: "src/components/blocks/faq.tsx" },
    { item: "faq-vue", target: "src/components/blocks/Faq.vue" },
    { item: "faq-svelte", target: "src/components/blocks/Faq.svelte" },
    { item: "faq-solid", target: "src/components/blocks/faq.tsx" },
  ];

  for (const { item, target } of variants) {
    it(`installs ${item} into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({ registry, projectDir: project(), name: item, manifest });

      expect(result.installed).toEqual([item]);

      const written = await readFile(join(project(), target), "utf8");
      // Composed from the primitives the registry entry advertises: an
      // Accordion for the questions, an Alert with a Button when they fail to
      // load and Skeleton placeholders while they load…
      for (const primitive of ["Accordion", "Alert", "Button", "Skeleton"]) {
        expect(written).toContain(primitive);
      }
      // …one question per item, each a heading around its trigger, the open
      // one closable, the whole list inert when disabled…
      expect(written).toContain("Accordion.ItemTrigger");
      expect(written).toContain("Accordion.ItemContent");
      expect(written).toContain("<h3>");
      expect(written).toContain("collapsible");
      expect(written).toContain("disabled");
      // …its chevron drawn inline so no icon package is needed…
      expect(written).toContain("Accordion.ItemIndicator");
      expect(written).toContain('stroke="currentColor"');
      // …the heading in the theme's display face…
      expect(written).toContain("font-serif");
      // …laid out from its container rather than the viewport, one decision per
      // contract step (ADR-0005): the support line on one row, a larger
      // heading, then more room above and below…
      expect(written).toContain("@container");
      expect(written).toContain("@sm:flex");
      expect(written).toContain("@md:text-heading");
      expect(written).toContain("@lg:py-16");
      expect(written).not.toContain("@media");
      // …and carrying its own loading, empty and error renders.
      expect(written).toContain("aria-busy");
      expect(written).toContain("No questions here yet.");
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
      // The chevron is inline SVG and every primitive arrives with the
      // framework package, so `add` copies exactly one file and installs
      // nothing else.
      expect(entry.dependencies).toEqual([`@moderno-ui/${item.split("-").pop()}`]);
      expect(entry.registryDependencies ?? []).toEqual([]);
      expect(entry.files).toHaveLength(1);
    }
  });
});
