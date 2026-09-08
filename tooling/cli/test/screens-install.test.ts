import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readManifest } from "../src/manifest.ts";
import { addItem } from "../src/operations.ts";
import { createRegistry } from "../src/registry.ts";

/**
 * `moderno add <screen>` against the **real** catalog, into a temp project.
 *
 * `tiers-install.test.ts` proves transitive composition on a synthetic fixture
 * and `blocks-install.test.ts` proves the one-file block case on the shipped
 * registry; this is the tier the two meet at — a `registry:screen` whose
 * `registryDependencies` are the blocks it composes, installed by the command a
 * consumer actually types. What it holds the catalog to is the promise the
 * screens page makes: one command puts the screen *and* its blocks on disk,
 * each recorded under its own version, and the screen's source imports them
 * from where they landed.
 */
const registryDir = fileURLToPath(new URL("../../../registry", import.meta.url));

let project: string;
beforeEach(async () => {
  project = await mkdtemp(join(tmpdir(), "moderno-proj-"));
});
afterEach(async () => {
  await rm(project, { recursive: true, force: true });
});

describe("moderno add sign-in-<framework>", () => {
  /** React and Svelte are the two frameworks screens are authored in (spec #69). */
  const variants = [
    {
      item: "sign-in-react",
      target: "src/components/screens/sign-in.tsx",
      blocks: [
        { item: "login-form-react", target: "src/components/blocks/login-form.tsx" },
        { item: "alert-list-react", target: "src/components/blocks/alert-list.tsx" },
      ],
      imports: ["@/components/blocks/login-form", "@/components/blocks/alert-list"],
    },
    {
      item: "sign-in-svelte",
      target: "src/components/screens/SignIn.svelte",
      blocks: [
        { item: "login-form-svelte", target: "src/components/blocks/LoginForm.svelte" },
        { item: "alert-list-svelte", target: "src/components/blocks/AlertList.svelte" },
      ],
      imports: ["@/components/blocks/LoginForm.svelte", "@/components/blocks/AlertList.svelte"],
    },
  ];

  for (const { item, target, blocks, imports } of variants) {
    it(`installs ${item} and the blocks it composes into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project);
      const result = await addItem({ registry, projectDir: project, name: item, manifest });

      // Deepest first: the blocks are written before the screen that imports them.
      expect(result.installed).toEqual([...blocks.map((b) => b.item), item]);

      const written = await readFile(join(project, target), "utf8");
      // The screen composes the two blocks from where `add` just put them…
      for (const specifier of imports) expect(written).toContain(specifier);
      // …owns the viewport as a height, not as a set of breakpoints…
      expect(written).toContain("min-h-dvh");
      // …and reads every width off its own container, all three steps (ADR-0005).
      expect(written).toContain("@container");
      expect(written).toContain("@sm:");
      expect(written).toContain("@md:");
      expect(written).toContain("@lg:");
      expect(written).not.toContain("@media");

      // Each block is on disk as its own file, not inlined into the screen.
      for (const block of blocks) {
        expect(await readFile(join(project, block.target), "utf8")).toContain("@container");
      }

      const recorded = await readManifest(project);
      expect(recorded.items[item]!.type).toBe("registry:screen");
      expect(recorded.items[item]!.version).toBe(registry.getItem(item)!.version);
      expect(recorded.items[item]!.files[0]!.target).toBe(target);
      // Per item, not per screen: `moderno update login-form-react` stays possible.
      for (const block of blocks) {
        expect(recorded.items[block.item]!.type).toBe("registry:block");
        expect(recorded.items[block.item]!.version).toBe(registry.getItem(block.item)!.version);
      }
    });
  }

  it("declares its blocks as registry dependencies and pulls in no flow", async () => {
    const registry = await createRegistry(registryDir).load();
    for (const { item, blocks } of variants) {
      const entry = registry.getItem(item)!;
      expect(entry.type).toBe("registry:screen");
      expect(entry.dependencies).toEqual([`@moderno-ui/${item.split("-").pop()}`]);
      expect(entry.registryDependencies).toEqual(blocks.map((b) => b.item));
      // A screen is one file; what it composes arrives as its own items.
      expect(entry.files).toHaveLength(1);
    }
  });
});
