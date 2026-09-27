import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { NAVIGATE_CALL, registryDir, useFreshProject } from "./fresh-project.ts";

const project = useFreshProject();

describe("moderno add confirmation-<framework>", () => {
  /** Screens are authored in all four frameworks, one registry item each. */
  const variants = [
    {
      item: "confirmation-react",
      target: "src/components/screens/confirmation.tsx",
      block: { item: "order-summary-react", target: "src/components/blocks/order-summary.tsx" },
      specifier: "@/components/blocks/order-summary",
    },
    {
      item: "confirmation-vue",
      target: "src/components/screens/Confirmation.vue",
      block: { item: "order-summary-vue", target: "src/components/blocks/OrderSummary.vue" },
      specifier: "@/components/blocks/OrderSummary.vue",
    },
    {
      item: "confirmation-svelte",
      target: "src/components/screens/Confirmation.svelte",
      block: { item: "order-summary-svelte", target: "src/components/blocks/OrderSummary.svelte" },
      specifier: "@/components/blocks/OrderSummary.svelte",
    },
    {
      item: "confirmation-solid",
      target: "src/components/screens/confirmation.tsx",
      block: { item: "order-summary-solid", target: "src/components/blocks/order-summary.tsx" },
      specifier: "@/components/blocks/order-summary",
    },
  ];

  for (const { item, target, block, specifier } of variants) {
    it(`installs ${item} and the block it composes into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({ registry, projectDir: project(), name: item, manifest });

      // Deepest first: the block is written before the screen that imports it.
      expect(result.installed).toEqual([block.item, item]);

      const written = await readFile(join(project(), target), "utf8");
      // The screen composes its block from where `add` just put it…
      expect(written).toContain(specifier);
      expect(written).toContain("<OrderSummary");
      // …prints the page's one h1 itself, above the block's h2…
      expect(written).toMatch(/<h1\b/);
      // …owns the viewport as a height, not as a set of breakpoints…
      expect(written).toContain("min-h-dvh");
      // …reports Continue shopping and hands the retry through to the block…
      expect(written).toMatch(/onContinue|\{oncontinue\}|oncontinue=|emit\('continue'\)/);
      expect(written).toMatch(/onRetry=\{|\{onretry\}|emit\('retry'\)/);
      // …and reads every width off its own container, its @sm, @md and @lg steps (ADR-0005).
      expect(written).toContain("@container");
      expect(written).toContain("@sm:");
      expect(written).toContain("@md:");
      expect(written).toContain("@lg:grid-cols-5");
      expect(written).not.toContain("@media");

      // Every link the screen draws itself (wordmark, orders, privacy, terms)
      // hands the click event back with the destination, so a router can
      // `preventDefault()`. Vue emits `navigate`; the other three call `onNavigate`.
      const navigateCalls = written.match(NAVIGATE_CALL) ?? [];
      expect(navigateCalls).toHaveLength(4);
      for (const call of navigateCalls) expect(call).toContain("event");

      // The block is on disk as its own file, not inlined into the screen.
      expect(await readFile(join(project(), block.target), "utf8")).toContain("@container");

      const recorded = await readManifest(project());
      expect(recorded.items[item]!.type).toBe("registry:screen");
      expect(recorded.items[item]!.version).toBe(registry.getItem(item)!.version);
      expect(recorded.items[item]!.files[0]!.target).toBe(target);
      // Per item, not per screen: `moderno update order-summary-react` stays possible.
      expect(recorded.items[block.item]!.type).toBe("registry:block");
      expect(recorded.items[block.item]!.version).toBe(registry.getItem(block.item)!.version);
    });
  }

  it("declares its block as a registry dependency and pulls in no flow", async () => {
    const registry = await createRegistry(registryDir).load();
    for (const { item, block } of variants) {
      const entry = registry.getItem(item)!;
      expect(entry.type).toBe("registry:screen");
      expect(entry.dependencies).toEqual([`@moderno-ui/${item.split("-").pop()}`]);
      expect(entry.registryDependencies).toEqual([block.item]);
      // A screen is one file; what it composes arrives as its own item.
      expect(entry.files).toHaveLength(1);
    }
  });
});
