import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { NAVIGATE_CALL, registryDir, useFreshProject } from "./fresh-project.ts";

const project = useFreshProject();

describe("moderno add referral-reward-<framework>", () => {
  /** Screens are authored in all four frameworks, one registry item each. */
  const variants = [
    {
      item: "referral-reward-react",
      target: "src/components/screens/referral-reward.tsx",
      blocks: [{ item: "kpi-card-react", target: "src/components/blocks/kpi-card.tsx" }],
      imports: ["@/components/blocks/kpi-card"],
    },
    {
      item: "referral-reward-vue",
      target: "src/components/screens/ReferralReward.vue",
      blocks: [{ item: "kpi-card-vue", target: "src/components/blocks/KpiCard.vue" }],
      imports: ["@/components/blocks/KpiCard.vue"],
    },
    {
      item: "referral-reward-svelte",
      target: "src/components/screens/ReferralReward.svelte",
      blocks: [{ item: "kpi-card-svelte", target: "src/components/blocks/KpiCard.svelte" }],
      imports: ["@/components/blocks/KpiCard.svelte"],
    },
    {
      item: "referral-reward-solid",
      target: "src/components/screens/referral-reward.tsx",
      blocks: [{ item: "kpi-card-solid", target: "src/components/blocks/kpi-card.tsx" }],
      imports: ["@/components/blocks/kpi-card"],
    },
  ];

  for (const { item, target, blocks, imports } of variants) {
    it(`installs ${item} and the blocks it composes into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({ registry, projectDir: project(), name: item, manifest });

      // Deepest first: the block is written before the screen that imports it.
      expect(result.installed).toEqual([...blocks.map((b) => b.item), item]);

      const written = await readFile(join(project(), target), "utf8");
      // The screen composes its block from where `add` just put it…
      for (const specifier of imports) expect(written).toContain(specifier);
      expect(written).toContain("<KpiCard");
      // …owns the viewport as a height, not as a set of breakpoints…
      expect(written).toContain("min-h-dvh");
      // …and reads every width off its own container, its @sm, @md and @lg steps (ADR-0005).
      expect(written).toContain("@container");
      expect(written).toContain("@sm:");
      expect(written).toContain("@md:");
      expect(written).toContain("@lg:");
      expect(written).not.toContain("@media");

      // Every link the screen draws itself (wordmark, share, privacy, terms)
      // hands the click event back with the destination, so a router can
      // `preventDefault()`. Vue emits `navigate`; the other three call `onNavigate`.
      const navigateCalls = written.match(NAVIGATE_CALL) ?? [];
      expect(navigateCalls).toHaveLength(4);
      for (const call of navigateCalls) expect(call).toContain("event");

      // The block is on disk as its own file, not inlined into the screen.
      for (const block of blocks) {
        expect(await readFile(join(project(), block.target), "utf8")).toContain("@container");
      }

      const recorded = await readManifest(project());
      expect(recorded.items[item]!.type).toBe("registry:screen");
      expect(recorded.items[item]!.version).toBe(registry.getItem(item)!.version);
      expect(recorded.items[item]!.files[0]!.target).toBe(target);
      // Per item, not per screen: `moderno update kpi-card-react` stays possible.
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
