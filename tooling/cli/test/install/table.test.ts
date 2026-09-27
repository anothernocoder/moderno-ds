import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { registryDir, useFreshProject } from "./fresh-project.ts";

const project = useFreshProject();

describe("moderno add table-<framework>", () => {
  /** Blocks are authored in all four frameworks, one registry item each. */
  const variants = [
    { item: "table-react", target: "src/components/blocks/table.tsx" },
    { item: "table-vue", target: "src/components/blocks/Table.vue" },
    { item: "table-svelte", target: "src/components/blocks/Table.svelte" },
    { item: "table-solid", target: "src/components/blocks/table.tsx" },
  ];

  for (const { item, target } of variants) {
    it(`installs ${item} into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({ registry, projectDir: project(), name: item, manifest });

      expect(result.installed).toEqual([item]);

      const written = await readFile(join(project(), target), "utf8");
      // Composed from the primitives the registry entry advertises: a Checkbox
      // per row and one for the page, a Menu of actions on each row and one for
      // the selected rows, a Badge per status, Pagination under the table, an
      // Alert with a retry when it fails and Skeleton rows while loading…
      for (const primitive of [
        "Alert",
        "Badge",
        "Button",
        "Checkbox",
        "Menu",
        "Pagination",
        "Skeleton",
      ]) {
        expect(written).toContain(primitive);
      }
      // …a real table with sortable headers and a caption, inside a frame that
      // scrolls sideways when the columns do not fit…
      expect(written).toContain("<table");
      expect(written).toContain("<caption");
      expect(written).toContain("aria-sort");
      expect(written).toContain('scope="row"');
      expect(written).toContain("overflow-x-auto");
      expect(written).toContain("min-w-max");
      expect(written).toContain("Bulk actions");
      expect(written).toContain("Clear selection");
      expect(written).toContain("Actions for ");
      // …laid out from its container rather than the viewport, one decision per
      // contract step (ADR-0005): the page row at the end, then a larger
      // heading, then the Issued column, each customer's email and more room…
      expect(written).toContain("@container");
      expect(written).toContain("@sm:justify-self-end");
      expect(written).toContain("@md:text-heading");
      expect(written).toContain("@lg:table-cell");
      expect(written).toContain("@lg:block");
      expect(written).toContain("@lg:py-16");
      expect(written).not.toContain("@media");
      // …and carrying its own loading, empty and error renders.
      expect(written).toContain("aria-busy");
      expect(written).toContain("You have not sent any invoices yet.");
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
      // Its arrows and dots are text glyphs, not icons, and every primitive
      // arrives with the framework package, so `add` copies exactly one file
      // and installs nothing else.
      expect(entry.dependencies).toEqual([`@moderno-ui/${item.split("-").pop()}`]);
      expect(entry.registryDependencies ?? []).toEqual([]);
      expect(entry.files).toHaveLength(1);
    }
  });
});
