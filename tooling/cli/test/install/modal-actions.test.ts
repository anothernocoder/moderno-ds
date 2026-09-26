import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { registryDir, useFreshProject } from "./fresh-project.ts";

const project = useFreshProject();

describe("moderno add modal-actions-<framework>", () => {
  /** Blocks are authored in all four frameworks, one registry item each. */
  const variants = [
    { item: "modal-actions-react", target: "src/components/blocks/modal-actions.tsx" },
    { item: "modal-actions-vue", target: "src/components/blocks/ModalActions.vue" },
    { item: "modal-actions-svelte", target: "src/components/blocks/ModalActions.svelte" },
    { item: "modal-actions-solid", target: "src/components/blocks/modal-actions.tsx" },
  ];

  for (const { item, target } of variants) {
    it(`installs ${item} into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({ registry, projectDir: project(), name: item, manifest });

      expect(result.installed).toEqual([item]);

      const written = await readFile(join(project(), target), "utf8");
      // Composed from the primitives the registry entry advertises: a Button
      // per row that opens a Dialog, a Field for the form dialog, a Badge on an
      // irreversible row, inside a Card…
      for (const primitive of ["Dialog", "Button", "Field", "Badge", "Card", "Skeleton", "Alert"]) {
        expect(written).toContain(primitive);
      }
      // …with a confirmation, a destructive alertdialog and a one-field form…
      expect(written).toContain("alertdialog");
      expect(written).toContain('"destructive"');
      expect(written).toContain('type="submit"');
      // …laid out from its container rather than the viewport, one decision per
      // contract step (ADR-0005): the button beside its text, a larger heading,
      // then the heading beside the list; each dialog is a container of its own…
      expect(written).toContain("@container");
      expect(written).toContain("@sm:flex");
      expect(written).toContain("@sm:flex-row");
      expect(written).toContain("@md:text-heading-sm");
      expect(written).toContain("@lg:grid-cols-3");
      expect(written).not.toContain("@media");
      // …and carrying its own loading and empty renders.
      expect(written).toContain("aria-busy");
      expect(written).toContain("No actions yet");

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
