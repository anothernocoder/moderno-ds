import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { NAVIGATE_CALL, registryDir, useFreshProject } from "./fresh-project.ts";

const project = useFreshProject();

describe("moderno add payment-<framework>", () => {
  /** Screens are authored in all four frameworks, one registry item each. */
  const variants = [
    {
      item: "payment-react",
      target: "src/components/screens/payment.tsx",
      blocks: [
        { item: "checkout-form-react", target: "src/components/blocks/checkout-form.tsx" },
        { item: "order-summary-react", target: "src/components/blocks/order-summary.tsx" },
      ],
      imports: ["@/components/blocks/checkout-form", "@/components/blocks/order-summary"],
    },
    {
      item: "payment-vue",
      target: "src/components/screens/Payment.vue",
      blocks: [
        { item: "checkout-form-vue", target: "src/components/blocks/CheckoutForm.vue" },
        { item: "order-summary-vue", target: "src/components/blocks/OrderSummary.vue" },
      ],
      imports: ["@/components/blocks/CheckoutForm.vue", "@/components/blocks/OrderSummary.vue"],
    },
    {
      item: "payment-svelte",
      target: "src/components/screens/Payment.svelte",
      blocks: [
        { item: "checkout-form-svelte", target: "src/components/blocks/CheckoutForm.svelte" },
        { item: "order-summary-svelte", target: "src/components/blocks/OrderSummary.svelte" },
      ],
      imports: [
        "@/components/blocks/CheckoutForm.svelte",
        "@/components/blocks/OrderSummary.svelte",
      ],
    },
    {
      item: "payment-solid",
      target: "src/components/screens/payment.tsx",
      blocks: [
        { item: "checkout-form-solid", target: "src/components/blocks/checkout-form.tsx" },
        { item: "order-summary-solid", target: "src/components/blocks/order-summary.tsx" },
      ],
      imports: ["@/components/blocks/checkout-form", "@/components/blocks/order-summary"],
    },
  ];

  for (const { item, target, blocks, imports } of variants) {
    it(`installs ${item} and the blocks it composes into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({ registry, projectDir: project(), name: item, manifest });

      // Deepest first: both blocks are written before the screen that imports them.
      expect(result.installed).toEqual([...blocks.map((b) => b.item), item]);

      const written = await readFile(join(project(), target), "utf8");
      // The screen composes its blocks from where `add` just put them…
      for (const specifier of imports) expect(written).toContain(specifier);
      expect(written).toContain("<CheckoutForm");
      expect(written).toContain("<OrderSummary");
      // …asks the form for its payment step, with its heading as the page's h1…
      expect(written).toContain('step="payment"');
      expect(written).toMatch(/headingLevel=\{1\}|:heading-level="1"/);
      // …owns the viewport as a height, not as a set of breakpoints…
      expect(written).toContain("min-h-dvh");
      // …hands every callback through to the blocks…
      expect(written).toMatch(/onSubmit=\{|\{onsubmit\}|emit\('submit'/);
      expect(written).toMatch(/onBack=\{|\{onback\}|emit\('back'\)/);
      expect(written).toMatch(/onRetry=\{|\{onretry\}|emit\('retry'\)/);
      // …and reads every width off its own container, its @sm, @md and @lg steps (ADR-0005).
      expect(written).toContain("@container");
      expect(written).toContain("@sm:");
      expect(written).toContain("@md:");
      expect(written).toContain("@lg:grid-cols-5");
      expect(written).not.toContain("@media");

      // Every link the screen draws itself (wordmark, cart, privacy, terms)
      // hands the click event back with the destination, so a router can
      // `preventDefault()`. Vue emits `navigate`; the other three call `onNavigate`.
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
      // Per item, not per screen: `moderno update order-summary-react` stays possible.
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
