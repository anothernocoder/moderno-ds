import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { registryDir, useFreshProject } from "./fresh-project.ts";

const project = useFreshProject();

describe("moderno add share-invite-<framework>", () => {
  /** Blocks are authored in all four frameworks, one registry item each. */
  const variants = [
    { item: "share-invite-react", target: "src/components/blocks/share-invite.tsx" },
    { item: "share-invite-vue", target: "src/components/blocks/ShareInvite.vue" },
    { item: "share-invite-svelte", target: "src/components/blocks/ShareInvite.svelte" },
    { item: "share-invite-solid", target: "src/components/blocks/share-invite.tsx" },
  ];

  for (const { item, target } of variants) {
    it(`installs ${item} into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({ registry, projectDir: project(), name: item, manifest });

      expect(result.installed).toEqual([item]);

      const written = await readFile(join(project(), target), "utf8");
      // Composed from the primitives the registry entry advertises, the
      // feedback given by the Toast primitive rather than a hand-rolled one…
      for (const primitive of [
        "Alert",
        "Avatar",
        "Badge",
        "Button",
        "Card",
        "Field",
        "Skeleton",
        "Spinner",
        "Toast",
        "Toaster",
        "createToaster",
      ]) {
        expect(written).toContain(primitive);
      }
      // …reporting every outcome — the copy, the share and the invite — in a toast…
      expect(written).toContain("navigator.clipboard.writeText");
      for (const title of ["Link copied", "Invite sent", "Shared to", "Invite not sent"]) {
        expect(written).toContain(title);
      }
      // …responsive to its container rather than the viewport, and using all
      // three contract steps (ADR-0005) — rows side by side, people in two
      // columns, two panes…
      expect(written).toContain("@container");
      expect(written).toContain("@sm:flex");
      expect(written).toContain("@md:grid-cols-2");
      expect(written).toContain("@lg:grid-cols-2");
      expect(written).not.toContain("@media");
      // …and carrying the states the block advertises: a busy region while
      // it loads, and an empty render of its own.
      expect(written).toContain("aria-busy");
      expect(written).toContain("Only you have access");

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
      // The primitives, Toast included, come from the framework package; the
      // block draws no icon, so no icon package is installed and `add` copies
      // one file.
      expect(entry.dependencies).toEqual([`@moderno-ui/${item.split("-").pop()}`]);
      expect(entry.registryDependencies ?? []).toEqual([]);
      expect(entry.files).toHaveLength(1);
    }
  });
});
