import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { registryDir, useFreshProject } from "./fresh-project.ts";

const project = useFreshProject();

describe("moderno add list-<framework>", () => {
  /** Blocks are authored in all four frameworks, one registry item each. */
  const variants = [
    {
      item: "list-react",
      target: "src/components/blocks/list.tsx",
      errorOverLoading: /\{error \? \([\s\S]*\{!error && loading \? \(/,
    },
    {
      item: "list-vue",
      target: "src/components/blocks/List.vue",
      errorOverLoading: /v-if="error"[\s\S]*v-else-if="loading"/,
    },
    {
      item: "list-svelte",
      target: "src/components/blocks/List.svelte",
      errorOverLoading: /\{#if error\}[\s\S]*\{:else if loading\}/,
    },
    {
      item: "list-solid",
      target: "src/components/blocks/list.tsx",
      errorOverLoading:
        /<Show when=\{props\.error\}>[\s\S]*<Show when=\{!props\.error && props\.loading\}>/,
    },
  ];

  /** The row buttons, beside a status or fact and without one (see the e2e spec). */
  const actionsBesideFacts =
    "col-start-2 flex gap-2 @sm:col-start-3 @sm:row-span-2 @sm:row-start-1 @md:col-start-4 @md:row-span-1";
  const actionsAlone = "col-start-2 flex gap-2 @sm:col-start-3 @sm:row-start-1 @md:col-start-4";

  for (const { item, target, errorOverLoading } of variants) {
    it(`installs ${item} into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({ registry, projectDir: project(), name: item, manifest });

      expect(result.installed).toEqual([item]);

      const written = await readFile(join(project(), target), "utf8");
      // Composed from the primitives the registry entry advertises: rows in a
      // Card, each with an Avatar, a status Badge and its own Buttons…
      for (const primitive of ["Card", "Avatar", "Badge", "Button", "Skeleton", "Alert"]) {
        expect(written).toContain(primitive);
      }
      // …laid out from its container rather than the viewport, one decision per
      // contract step (ADR-0005): buttons at the row's end, a status column,
      // then the facts lined up…
      expect(written).toContain("@container");
      expect(written).toContain("@sm:col-start-3");
      expect(written).toContain("@md:col-start-4");
      expect(written).toContain("@lg:w-28");
      expect(written).not.toContain("@media");
      // …spanning the buttons over the status row only when a row has one, so
      // a row without a status or fact grows no empty row at `@sm`…
      expect(written).toContain(actionsBesideFacts);
      expect(written).toContain(actionsAlone);
      // …carrying its own loading and empty renders, where a failed load wins
      // over loading in every framework, and naming every row action after
      // its record.
      expect(written).toMatch(errorOverLoading);
      expect(written).toContain("aria-busy");
      expect(written).toContain("No members yet");
      expect(written).toContain("`Edit ${item.title}`");
      expect(written).toContain("`Remove ${item.title}`");

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
