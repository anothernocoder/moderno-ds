import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { registryDir, useFreshProject } from "./fresh-project.ts";

const project = useFreshProject();

describe("moderno add app-shell-<framework>", () => {
  /** Blocks are authored in all four frameworks, one registry item each. */
  const variants = [
    { item: "app-shell-react", target: "src/components/blocks/app-shell.tsx" },
    { item: "app-shell-vue", target: "src/components/blocks/AppShell.vue" },
    { item: "app-shell-svelte", target: "src/components/blocks/AppShell.svelte" },
    { item: "app-shell-solid", target: "src/components/blocks/app-shell.tsx" },
  ];

  for (const { item, target } of variants) {
    it(`installs ${item} into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({ registry, projectDir: project(), name: item, manifest });

      expect(result.installed).toEqual([item]);

      const written = await readFile(join(project(), target), "utf8");
      // Composed from the primitives the registry entry advertises: a Drawer
      // holding the navigation on narrow containers, an account Menu with an
      // Avatar, a Button to open the Drawer, an Alert with a retry when the page
      // fails and Skeleton placeholders while it loads…
      for (const primitive of ["Alert", "Avatar", "Button", "Drawer", "Menu", "Skeleton"]) {
        expect(written).toContain(primitive);
      }
      // …a sidebar with the main navigation, a top bar with the page heading and
      // the account menu, and the page's content…
      expect(written).toContain('<nav aria-label="Main"');
      expect(written).toContain("aria-current");
      expect(written).toContain("<header");
      expect(written).toContain("<h1");
      expect(written).toContain("<main");
      expect(written).toContain('placement="left"');
      expect(written).toContain("Sign out");
      // …laid out from its container rather than the viewport, one decision per
      // contract step (ADR-0005): the user's name in the account trigger, then
      // the sidebar in place of the Drawer button, then a wider sidebar and more
      // room around the content…
      expect(written).toContain("@container");
      expect(written).toContain("hidden @sm:inline");
      expect(written).toContain("@md:hidden");
      expect(written).toContain("@md:flex");
      expect(written).toContain("@lg:w-64");
      expect(written).toContain("@lg:p-8");
      expect(written).not.toContain("@media");
      // …and carrying its own loading, empty and error renders.
      expect(written).toContain("aria-busy");
      expect(written).toContain("Nothing here yet");
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
