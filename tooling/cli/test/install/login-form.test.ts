import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { registryDir, useFreshProject } from "./fresh-project.ts";

const project = useFreshProject();

describe("moderno add login-form-<framework>", () => {
  /** Blocks are authored in all four frameworks, one registry item each. */
  const variants = [
    { item: "login-form-react", target: "src/components/blocks/login-form.tsx" },
    { item: "login-form-vue", target: "src/components/blocks/LoginForm.vue" },
    { item: "login-form-svelte", target: "src/components/blocks/LoginForm.svelte" },
    { item: "login-form-solid", target: "src/components/blocks/login-form.tsx" },
  ];

  for (const { item, target } of variants) {
    it(`installs ${item} into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({ registry, projectDir: project(), name: item, manifest });

      expect(result.installed).toEqual([item]);

      const written = await readFile(join(project(), target), "utf8");
      // Composed from the primitives the registry entry advertises…
      expect(written).toContain("Card");
      expect(written).toContain("Field");
      expect(written).toContain("Checkbox");
      expect(written).toContain("Button");
      expect(written).toContain("Alert");
      // …responsive to its container rather than the viewport (ADR-0005)…
      expect(written).toContain("@container");
      expect(written).not.toContain("@media");
      // …and carrying the states the block advertises.
      expect(written).toContain("aria-busy");

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
      expect(entry.dependencies).toEqual([`@moderno-ui/${item.split("-").pop()}`]);
      // The primitives arrive with that package; nothing is ejected alongside,
      // so `add` copies exactly one file and leaves the project's tree alone.
      expect(entry.registryDependencies ?? []).toEqual([]);
      expect(entry.files).toHaveLength(1);
    }
  });
});
