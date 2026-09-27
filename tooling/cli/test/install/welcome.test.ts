import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { NAVIGATE_CALL, registryDir, useFreshProject } from "./fresh-project.ts";

const project = useFreshProject();

describe("moderno add welcome-<framework>", () => {
  /** Screens are authored in all four frameworks, one registry item each. */
  const variants = [
    {
      item: "welcome-react",
      target: "src/components/screens/welcome.tsx",
      blocks: [{ item: "hero-react", target: "src/components/blocks/hero.tsx" }],
      imports: ["@/components/blocks/hero"],
    },
    {
      item: "welcome-vue",
      target: "src/components/screens/Welcome.vue",
      blocks: [{ item: "hero-vue", target: "src/components/blocks/Hero.vue" }],
      imports: ["@/components/blocks/Hero.vue"],
    },
    {
      item: "welcome-svelte",
      target: "src/components/screens/Welcome.svelte",
      blocks: [{ item: "hero-svelte", target: "src/components/blocks/Hero.svelte" }],
      imports: ["@/components/blocks/Hero.svelte"],
    },
    {
      item: "welcome-solid",
      target: "src/components/screens/welcome.tsx",
      blocks: [{ item: "hero-solid", target: "src/components/blocks/hero.tsx" }],
      imports: ["@/components/blocks/hero"],
    },
  ];

  for (const { item, target, blocks, imports } of variants) {
    it(`installs ${item} and the blocks it composes into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({ registry, projectDir: project(), name: item, manifest });

      // Deepest first: the blocks are written before the screen that imports them.
      expect(result.installed).toEqual([...blocks.map((b) => b.item), item]);

      const written = await readFile(join(project(), target), "utf8");
      // The screen composes its block from where `add` just put them…
      for (const specifier of imports) expect(written).toContain(specifier);
      // …owns the viewport as a height, not as a set of breakpoints…
      expect(written).toContain("min-h-dvh");
      // …and reads every width off its own container, its @sm and @md steps (ADR-0005).
      expect(written).toContain("@container");
      expect(written).toContain("@sm:");
      expect(written).toContain("@md:");
      expect(written).not.toContain("@media");

      // Every link the screen draws itself hands the click event back with the
      // destination, or the `preventDefault()` the docs promise a router is
      // unwritable: a consumer would get the callback *and* a full document
      // navigation on every masthead and footer link. Vue emits `navigate`;
      // the other three call `onNavigate`.
      const navigateCalls = written.match(NAVIGATE_CALL) ?? [];
      expect(navigateCalls).toHaveLength(4);
      for (const call of navigateCalls) expect(call).toContain("event");

      // Each block is on disk as its own file, not inlined into the screen.
      for (const block of blocks) {
        expect(await readFile(join(project(), block.target), "utf8")).toContain("@container");
      }

      const recorded = await readManifest(project());
      expect(recorded.items[item]!.type).toBe("registry:screen");
      expect(recorded.items[item]!.version).toBe(registry.getItem(item)!.version);
      expect(recorded.items[item]!.files[0]!.target).toBe(target);
      // Per item, not per screen: `moderno update hero-react` stays possible.
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
