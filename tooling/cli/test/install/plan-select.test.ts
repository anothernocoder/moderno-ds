import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { NAVIGATE_CALL, registryDir, useFreshProject } from "./fresh-project.ts";

const project = useFreshProject();

describe("moderno add plan-select-<framework>", () => {
  /** Screens are authored in all four frameworks, one registry item each. */
  const variants = [
    {
      item: "plan-select-react",
      target: "src/components/screens/plan-select.tsx",
      blocks: [{ item: "pricing-react", target: "src/components/blocks/pricing.tsx" }],
      imports: ["@/components/blocks/pricing"],
    },
    {
      item: "plan-select-vue",
      target: "src/components/screens/PlanSelect.vue",
      blocks: [{ item: "pricing-vue", target: "src/components/blocks/Pricing.vue" }],
      imports: ["@/components/blocks/Pricing.vue"],
    },
    {
      item: "plan-select-svelte",
      target: "src/components/screens/PlanSelect.svelte",
      blocks: [{ item: "pricing-svelte", target: "src/components/blocks/Pricing.svelte" }],
      imports: ["@/components/blocks/Pricing.svelte"],
    },
    {
      item: "plan-select-solid",
      target: "src/components/screens/plan-select.tsx",
      blocks: [{ item: "pricing-solid", target: "src/components/blocks/pricing.tsx" }],
      imports: ["@/components/blocks/pricing"],
    },
  ];

  for (const { item, target, blocks, imports } of variants) {
    it(`installs ${item} and the block it composes into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({ registry, projectDir: project(), name: item, manifest });

      // Deepest first: the block is written before the screen that imports it.
      expect(result.installed).toEqual([...blocks.map((b) => b.item), item]);

      const written = await readFile(join(project(), target), "utf8");
      // The screen composes its block from where `add` just put it…
      for (const specifier of imports) expect(written).toContain(specifier);
      // …makes the block's title the page's h1…
      expect(written).toMatch(/titleLevel=\{1\}|:title-level="1"/);
      // …owns the viewport as a height, not as a set of breakpoints…
      expect(written).toContain("min-h-dvh");
      // …and reads every width off its own container, its @sm and @md steps (ADR-0005).
      expect(written).toContain("@container");
      expect(written).toContain("@sm:");
      expect(written).toContain("@md:");
      expect(written).not.toContain("@media");

      // Every link the screen draws itself hands the click event back with the
      // destination, so a router can `preventDefault()`. Vue emits `navigate`;
      // the other three call `onNavigate`.
      const navigateCalls = written.match(NAVIGATE_CALL) ?? [];
      expect(navigateCalls).toHaveLength(4);
      for (const call of navigateCalls) expect(call).toContain("event");

      // The block is on disk as its own file, and it is the one that knows
      // `titleLevel` — the screen does not print a heading of its own.
      for (const block of blocks) {
        const blockSource = await readFile(join(project(), block.target), "utf8");
        expect(blockSource).toContain("@container");
        expect(blockSource).toContain("titleLevel");
      }

      const recorded = await readManifest(project());
      expect(recorded.items[item]!.type).toBe("registry:screen");
      expect(recorded.items[item]!.version).toBe(registry.getItem(item)!.version);
      expect(recorded.items[item]!.files[0]!.target).toBe(target);
      // Per item, not per screen: `moderno update pricing-react` stays possible.
      for (const block of blocks) {
        expect(recorded.items[block.item]!.type).toBe("registry:block");
        expect(recorded.items[block.item]!.version).toBe(registry.getItem(block.item)!.version);
      }
    });
  }

  it("declares its block as a registry dependency and pulls in no flow", async () => {
    const registry = await createRegistry(registryDir).load();
    for (const { item, blocks } of variants) {
      const entry = registry.getItem(item)!;
      expect(entry.type).toBe("registry:screen");
      expect(entry.dependencies).toEqual([`@moderno-ui/${item.split("-").pop()}`]);
      expect(entry.registryDependencies).toEqual(blocks.map((b) => b.item));
      // A screen is one file; what it composes arrives as its own item.
      expect(entry.files).toHaveLength(1);
    }
  });
});
