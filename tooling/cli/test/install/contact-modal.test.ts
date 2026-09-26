import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { registryDir, useFreshProject } from "./fresh-project.ts";

const project = useFreshProject();

describe("moderno add contact-modal-<framework>", () => {
  /** Blocks are authored in all four frameworks, one registry item each. */
  const variants = [
    { item: "contact-modal-react", target: "src/components/blocks/contact-modal.tsx" },
    { item: "contact-modal-vue", target: "src/components/blocks/ContactModal.vue" },
    { item: "contact-modal-svelte", target: "src/components/blocks/ContactModal.svelte" },
    { item: "contact-modal-solid", target: "src/components/blocks/contact-modal.tsx" },
  ];

  for (const { item, target } of variants) {
    it(`installs ${item} into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({ registry, projectDir: project(), name: item, manifest });

      expect(result.installed).toEqual([item]);

      const written = await readFile(join(project(), target), "utf8");
      // Composed from the primitives the registry entry advertises: a Button
      // that opens a Dialog holding a Field per input and an Alert…
      for (const primitive of ["Dialog", "Button", "Field", "Alert"]) {
        expect(written).toContain(primitive);
      }
      // …a lead form that refuses an empty name or email…
      expect(written).toContain('type="submit"');
      expect(written).toContain("Enter your name.");
      expect(written).toContain("Enter your work email.");
      // …laid out from its container rather than the viewport, one decision per
      // contract step (ADR-0005); the dialog is a container of its own…
      expect(written).toContain("@container");
      expect(written).toContain("@sm:justify-self-center");
      expect(written).toContain("@sm:grid-cols-2");
      expect(written).toContain("@sm:flex-row");
      expect(written).toContain("@md:text-heading");
      expect(written).toContain("@lg:grid-cols-");
      expect(written).not.toContain("@media");
      // …and carrying its own loading and sent renders.
      expect(written).toContain("aria-busy");
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
      // No icons, so no icon package: every primitive arrives with the
      // framework package, and `add` copies exactly one file.
      expect(entry.dependencies).toEqual([`@moderno-ui/${item.split("-").pop()}`]);
      expect(entry.registryDependencies ?? []).toEqual([]);
      expect(entry.files).toHaveLength(1);
    }
  });
});
