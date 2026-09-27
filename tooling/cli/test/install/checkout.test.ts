import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem, updateItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { registryDir, useFreshProject } from "./fresh-project.ts";

/**
 * `moderno add checkout-<framework>` against the real catalog, into a temp
 * project: the flow, its five screens and the four blocks they compose, each
 * written once and recorded under its own version. Then the reason per-item
 * entries exist: an edited assembly is left alone by `update`, while the
 * untouched screens beside it still update on their own.
 */

/** The checkout flow's screens, in the order the catalog declares them. */
const SCREENS = ["cart", "shipping", "payment", "review", "confirmation"] as const;

/**
 * The blocks under the screens, in the order `add` writes them: each one just
 * before the first screen that needs it, and never again for the screens after.
 */
const BLOCKS = {
  cart: ["shopping-cart"],
  shipping: ["checkout-form", "order-summary"],
  payment: [],
  review: ["description-list"],
  confirmation: [],
} as const satisfies Record<(typeof SCREENS)[number], readonly string[]>;

interface Variant {
  framework: string;
  /** Where the assembly lands in the consumer project. */
  target: string;
  /** The five screen files, in `SCREENS` order. */
  screenTargets: string[];
  /** The specifiers the assembly imports its screens through. */
  imports: string[];
  /** Where each block lands. */
  blockTargets: string[];
}

const variants: Variant[] = [
  {
    framework: "react",
    target: "src/components/flows/checkout-flow.tsx",
    screenTargets: SCREENS.map((screen) => `src/components/screens/${screen}.tsx`),
    imports: SCREENS.map((screen) => `@/components/screens/${screen}`),
    blockTargets: [
      "src/components/blocks/shopping-cart.tsx",
      "src/components/blocks/checkout-form.tsx",
      "src/components/blocks/order-summary.tsx",
      "src/components/blocks/description-list.tsx",
    ],
  },
  {
    framework: "vue",
    target: "src/components/flows/CheckoutFlow.vue",
    screenTargets: [
      "src/components/screens/Cart.vue",
      "src/components/screens/Shipping.vue",
      "src/components/screens/Payment.vue",
      "src/components/screens/Review.vue",
      "src/components/screens/Confirmation.vue",
    ],
    imports: [
      "@/components/screens/Cart.vue",
      "@/components/screens/Shipping.vue",
      "@/components/screens/Payment.vue",
      "@/components/screens/Review.vue",
      "@/components/screens/Confirmation.vue",
    ],
    blockTargets: [
      "src/components/blocks/ShoppingCart.vue",
      "src/components/blocks/CheckoutForm.vue",
      "src/components/blocks/OrderSummary.vue",
      "src/components/blocks/DescriptionList.vue",
    ],
  },
  {
    framework: "svelte",
    target: "src/components/flows/CheckoutFlow.svelte",
    screenTargets: [
      "src/components/screens/Cart.svelte",
      "src/components/screens/Shipping.svelte",
      "src/components/screens/Payment.svelte",
      "src/components/screens/Review.svelte",
      "src/components/screens/Confirmation.svelte",
    ],
    imports: [
      "@/components/screens/Cart.svelte",
      "@/components/screens/Shipping.svelte",
      "@/components/screens/Payment.svelte",
      "@/components/screens/Review.svelte",
      "@/components/screens/Confirmation.svelte",
    ],
    blockTargets: [
      "src/components/blocks/ShoppingCart.svelte",
      "src/components/blocks/CheckoutForm.svelte",
      "src/components/blocks/OrderSummary.svelte",
      "src/components/blocks/DescriptionList.svelte",
    ],
  },
  {
    framework: "solid",
    target: "src/components/flows/checkout-flow.tsx",
    screenTargets: SCREENS.map((screen) => `src/components/screens/${screen}.tsx`),
    imports: SCREENS.map((screen) => `@/components/screens/${screen}`),
    blockTargets: [
      "src/components/blocks/shopping-cart.tsx",
      "src/components/blocks/checkout-form.tsx",
      "src/components/blocks/order-summary.tsx",
      "src/components/blocks/description-list.tsx",
    ],
  },
];

const project = useFreshProject();

describe("moderno add checkout-<framework>", () => {
  for (const variant of variants) {
    const flow = `checkout-${variant.framework}`;
    const itemName = (name: string) => `${name}-${variant.framework}`;
    const blocks = SCREENS.flatMap((screen) => BLOCKS[screen]).map(itemName);

    it(`installs ${flow}, its five screens and the blocks they compose`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({ registry, projectDir: project(), name: flow, manifest });

      // Deepest first, and each item exactly once however many screens want it:
      // order-summary is written for shipping and not again for the three
      // screens after it that also show the order.
      expect(result.installed).toEqual([
        ...SCREENS.flatMap((screen) => [...BLOCKS[screen].map(itemName), itemName(screen)]),
        flow,
      ]);

      // The assembly composes the five screens from where `add` just put them.
      const assembly = await readFile(join(project(), variant.target), "utf8");
      for (const specifier of variant.imports) expect(assembly).toContain(specifier);

      // Every screen and every block is on disk as its own file, not inlined.
      for (const target of [...variant.screenTargets, ...variant.blockTargets]) {
        expect((await readFile(join(project(), target), "utf8")).length).toBeGreaterThan(0);
      }

      // Per item, not per flow: each one keeps its own type, version and file.
      const recorded = await readManifest(project());
      expect(recorded.items[flow]!.type).toBe("registry:flow");
      expect(recorded.items[flow]!.version).toBe(registry.getItem(flow)!.version);
      expect(recorded.items[flow]!.files[0]!.target).toBe(variant.target);
      for (const [index, screen] of SCREENS.entries()) {
        const name = itemName(screen);
        expect(recorded.items[name]!.type).toBe("registry:screen");
        expect(recorded.items[name]!.version).toBe(registry.getItem(name)!.version);
        expect(recorded.items[name]!.files[0]!.target).toBe(variant.screenTargets[index]);
      }
      for (const [index, block] of blocks.entries()) {
        expect(recorded.items[block]!.type).toBe("registry:block");
        expect(recorded.items[block]!.version).toBe(registry.getItem(block)!.version);
        expect(recorded.items[block]!.files[0]!.target).toBe(variant.blockTargets[index]);
      }
    });

    it(`leaves an edited ${flow} alone while updating the screens beside it`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      await addItem({ registry, projectDir: project(), name: flow, manifest });

      // The assembly is the file the flow exists to have rewritten.
      const assemblyFile = join(project(), variant.target);
      const edited = `${await readFile(assemblyFile, "utf8")}\n// wired to our own router\n`;
      await writeFile(assemblyFile, edited);

      const installed = await readManifest(project());
      const flowUpdate = await updateItem({
        registry,
        projectDir: project(),
        name: flow,
        manifest: installed,
      });
      expect(flowUpdate.status).toBe("skipped-edited");
      expect(await readFile(assemblyFile, "utf8")).toBe(edited);

      // …and every untouched item in the same tree still updates on its own.
      for (const name of [...SCREENS.map(itemName), ...blocks]) {
        const update = await updateItem({
          registry,
          projectDir: project(),
          name,
          manifest: installed,
        });
        expect(update.status, name).toBe("up-to-date");
        expect(update.files.every((file) => file.status !== "skipped-edited")).toBe(true);
      }
      expect(await readFile(assemblyFile, "utf8")).toBe(edited);
    });
  }

  it("declares its screens as registry dependencies and nothing else", async () => {
    const registry = await createRegistry(registryDir).load();
    for (const variant of variants) {
      const entry = registry.getItem(`checkout-${variant.framework}`)!;
      expect(entry.type).toBe("registry:flow");
      expect(entry.registryDependencies).toEqual(
        SCREENS.map((screen) => `${screen}-${variant.framework}`),
      );
      // A flow is one file, the assembly; blocks and primitives arrive through
      // its screens, which also declare every `@moderno-ui/*` package.
      expect(entry.files).toHaveLength(1);
      expect(entry.dependencies).toEqual([]);
    }
  });

  it("installs a screen without the flow it belongs to", async () => {
    const registry = await createRegistry(registryDir).load();
    const manifest = await readManifest(project());
    const result = await addItem({ registry, projectDir: project(), name: "cart-react", manifest });
    expect(result.installed).not.toContain("checkout-react");
    expect((await readManifest(project())).items["checkout-react"]).toBeUndefined();
  });
});
