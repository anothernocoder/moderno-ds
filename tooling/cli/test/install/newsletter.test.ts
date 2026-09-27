import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { registryDir, useFreshProject } from "./fresh-project.ts";

const project = useFreshProject();

describe("moderno add newsletter-<framework>", () => {
  /** Blocks are authored in all four frameworks, one registry item each. */
  const variants = [
    { item: "newsletter-react", target: "src/components/blocks/newsletter.tsx" },
    { item: "newsletter-vue", target: "src/components/blocks/Newsletter.vue" },
    { item: "newsletter-svelte", target: "src/components/blocks/Newsletter.svelte" },
    { item: "newsletter-solid", target: "src/components/blocks/newsletter.tsx" },
  ];

  for (const { item, target } of variants) {
    it(`installs ${item} into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({ registry, projectDir: project(), name: item, manifest });

      expect(result.installed).toEqual([item]);

      const written = await readFile(join(project(), target), "utf8");
      // Composed from the primitives the registry entry advertises: a Field for
      // the email, a Button to subscribe and a success Alert once it is done…
      for (const primitive of ["Field", "Button", "Alert"]) {
        expect(written).toContain(primitive);
      }
      expect(written).toContain("Field.ErrorText");
      expect(written).toContain('variant="success"');
      // …one email field a consumer reads back, labelled for screen readers…
      expect(written).toContain('name="email"');
      expect(written).toContain('type="email"');
      expect(written).toContain("sr-only");
      // …the heading in the theme's display face on the card surface…
      expect(written).toContain("font-serif");
      expect(written).toContain("bg-card");
      // …laid out from its container rather than the viewport, one decision per
      // contract step (ADR-0005): the field and the button in one row, a larger
      // heading, then the text beside the form…
      expect(written).toContain("@container");
      expect(written).toContain("@sm:flex");
      expect(written).toContain("@md:text-heading");
      expect(written).toContain("@lg:grid-cols-2");
      expect(written).not.toContain("@media");
      // …and carrying its own loading and subscribed renders.
      expect(written).toContain("aria-busy");
      expect(written).toContain("Subscribing");
      expect(written).toContain("You are subscribed");

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
      // No icons, and every primitive arrives with the framework package, so
      // `add` copies exactly one file and installs nothing else.
      expect(entry.dependencies).toEqual([`@moderno-ui/${item.split("-").pop()}`]);
      expect(entry.registryDependencies ?? []).toEqual([]);
      expect(entry.files).toHaveLength(1);
    }
  });
});
