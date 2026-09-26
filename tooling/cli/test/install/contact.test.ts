import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { registryDir, useFreshProject } from "./fresh-project.ts";

const project = useFreshProject();

describe("moderno add contact-<framework>", () => {
  /** Blocks are authored in all four frameworks, one registry item each. */
  const variants = [
    { item: "contact-react", target: "src/components/blocks/contact.tsx" },
    { item: "contact-vue", target: "src/components/blocks/Contact.vue" },
    { item: "contact-svelte", target: "src/components/blocks/Contact.svelte" },
    { item: "contact-solid", target: "src/components/blocks/contact.tsx" },
  ];

  for (const { item, target } of variants) {
    it(`installs ${item} into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({ registry, projectDir: project(), name: item, manifest });

      expect(result.installed).toEqual([item]);

      const written = await readFile(join(project(), target), "utf8");
      // Composed from the primitives the registry entry advertises: a Field per
      // input, a Button to send, and an Alert when it fails or once it is sent…
      for (const primitive of ["Field", "Button", "Alert"]) {
        expect(written).toContain(primitive);
      }
      expect(written).toContain("Field.Textarea");
      expect(written).toContain('variant="error"');
      expect(written).toContain('variant="success"');
      // …the three named fields a consumer reads back…
      for (const field of ['name="name"', 'name="email"', 'name="message"']) {
        expect(written).toContain(field);
      }
      // …a link per channel that has one, with its icon drawn inline so no icon
      // package is needed…
      expect(written).toContain("mailto:");
      expect(written).toContain("tel:");
      expect(written).toContain('stroke="currentColor"');
      // …the heading in the theme's display face…
      expect(written).toContain("font-serif");
      // …laid out from its container rather than the viewport, one decision per
      // contract step (ADR-0005): the reply note beside the button, name and
      // email side by side with a larger heading, then the details beside the
      // form with more room above and below…
      expect(written).toContain("@container");
      expect(written).toContain("@sm:justify-between");
      expect(written).toContain("@md:grid-cols-2");
      expect(written).toContain("@md:text-heading");
      expect(written).toContain("@lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]");
      expect(written).toContain("@lg:py-16");
      expect(written).not.toContain("@media");
      // …and carrying its own loading and sent renders.
      expect(written).toContain("aria-busy");
      expect(written).toContain("Sending");
      expect(written).toContain("Message sent");

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
      // The icons are inline SVG and every primitive arrives with the framework
      // package, so `add` copies exactly one file and installs nothing else.
      expect(entry.dependencies).toEqual([`@moderno-ui/${item.split("-").pop()}`]);
      expect(entry.registryDependencies ?? []).toEqual([]);
      expect(entry.files).toHaveLength(1);
    }
  });
});
