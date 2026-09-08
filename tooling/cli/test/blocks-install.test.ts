import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readManifest } from "../src/manifest.ts";
import { addItem } from "../src/operations.ts";
import { createRegistry } from "../src/registry.ts";

/**
 * `moderno add <block>` against the **real** catalog, into a temp project.
 *
 * `tiers-install.test.ts` proves the composition rules on a synthetic fixture;
 * this proves the thing a consumer actually types works on the registry this
 * repo ships — that the manifest's paths point at files that exist, that the
 * file lands at the target the item declares, and that what arrives is the
 * block as authored rather than a stale copy. A block whose registry entry and
 * source drift apart fails here rather than in someone's project.
 */
const registryDir = fileURLToPath(new URL("../../../registry", import.meta.url));

let project: string;
beforeEach(async () => {
  project = await mkdtemp(join(tmpdir(), "moderno-proj-"));
});
afterEach(async () => {
  await rm(project, { recursive: true, force: true });
});

describe("moderno add login-form-<framework>", () => {
  /** React and Svelte are the two frameworks blocks are authored in (spec #69). */
  const variants = [
    { item: "login-form-react", target: "src/components/blocks/login-form.tsx" },
    { item: "login-form-svelte", target: "src/components/blocks/LoginForm.svelte" },
  ];

  for (const { item, target } of variants) {
    it(`installs ${item} into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project);
      const result = await addItem({ registry, projectDir: project, name: item, manifest });

      expect(result.installed).toEqual([item]);

      const written = await readFile(join(project, target), "utf8");
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

      const recorded = await readManifest(project);
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

describe("moderno add form-layout-<framework>", () => {
  /** React and Svelte are the two frameworks blocks are authored in (spec #69). */
  const variants = [
    { item: "form-layout-react", target: "src/components/blocks/form-layout.tsx" },
    { item: "form-layout-svelte", target: "src/components/blocks/FormLayout.svelte" },
  ];

  for (const { item, target } of variants) {
    it(`installs ${item} into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project);
      const result = await addItem({ registry, projectDir: project, name: item, manifest });

      expect(result.installed).toEqual([item]);

      const written = await readFile(join(project, target), "utf8");
      // Composed from the primitives the registry entry advertises…
      expect(written).toContain("Field");
      expect(written).toContain("Checkbox");
      expect(written).toContain("Divider");
      expect(written).toContain("Button");
      expect(written).toContain("Alert");
      // …responsive to its container rather than the viewport, and using all
      // three contract steps (ADR-0005) — one layout decision each…
      expect(written).toContain("@container");
      expect(written).toContain("@sm:");
      expect(written).toContain("@md:");
      expect(written).toContain("@lg:");
      expect(written).not.toContain("@media");
      // …and carrying the states the block advertises.
      expect(written).toContain("aria-busy");
      expect(written).toContain("ErrorText");

      const recorded = await readManifest(project);
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
      // No icon set and nothing ejected alongside: the primitives arrive with
      // the framework package, so `add` copies exactly one file.
      expect(entry.registryDependencies ?? []).toEqual([]);
      expect(entry.files).toHaveLength(1);
    }
  });
});

describe("moderno add alert-list-<framework>", () => {
  /** React and Svelte are the two frameworks blocks are authored in (spec #69). */
  const variants = [
    { item: "alert-list-react", target: "src/components/blocks/alert-list.tsx" },
    { item: "alert-list-svelte", target: "src/components/blocks/AlertList.svelte" },
  ];

  for (const { item, target } of variants) {
    it(`installs ${item} into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project);
      const result = await addItem({ registry, projectDir: project, name: item, manifest });

      expect(result.installed).toEqual([item]);

      const written = await readFile(join(project, target), "utf8");
      // Composed from the primitives the registry entry advertises…
      expect(written).toContain("Alert");
      expect(written).toContain("Button");
      expect(written).toContain("Card");
      // …in all four status variants, which is what makes it a list rather
      // than a repeated banner…
      for (const variant of ["info", "success", "warning", "error"]) {
        expect(written).toContain(`"${variant}"`);
      }
      // …responsive to its container rather than the viewport, and using all
      // three contract steps (ADR-0005) — one layout decision each…
      expect(written).toContain("@container");
      expect(written).toContain("@sm:");
      expect(written).toContain("@md:");
      expect(written).toContain("@lg:");
      expect(written).not.toContain("@media");
      // …and carrying the states the block advertises: a busy region while the
      // list loads, and an empty render of its own.
      expect(written).toContain("aria-busy");
      expect(written).toContain("caught up");

      const recorded = await readManifest(project);
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
      // The status glyphs are inline SVG stroking currentColor, not an icon
      // package, so nothing beyond the framework package is installed and
      // nothing is ejected alongside: `add` copies exactly one file.
      expect(entry.registryDependencies ?? []).toEqual([]);
      expect(entry.files).toHaveLength(1);
    }
  });
});
