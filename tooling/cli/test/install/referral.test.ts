import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem, updateItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { registryDir, useFreshProject } from "./fresh-project.ts";

/**
 * `moderno add referral-<framework>` against the **real** catalog, into a temp
 * project: the flow, its three screens and the block each screen composes, in
 * one command, each recorded under its own version.
 *
 * Unlike auth, the three referral screens share no block — each composes its
 * own — so what is held here is the order: every block lands right before the
 * screen that imports it, and the assembly lands last. The second half is the
 * reason per-item manifest entries exist: after a consumer edits the assembly
 * (which the flow exists to be edited), `update` leaves it alone while the
 * screens beside it still update on their own.
 */

/** The referral flow's screens, in the order the catalog declares them. */
const SCREENS = ["referral-invite", "referral-share", "referral-reward"] as const;

interface Variant {
  framework: string;
  /** Where the assembly lands in the consumer project. */
  target: string;
  /** The three screen files, in `SCREENS` order. */
  screenTargets: string[];
  /** The specifiers the assembly imports its screens through. */
  imports: string[];
  /** The block each screen composes, in `SCREENS` order, and where it lands. */
  blocks: Array<{ item: string; target: string }>;
}

/** Flows are authored in all four frameworks, one registry item each. */
const variants: Variant[] = [
  {
    framework: "react",
    target: "src/components/flows/referral-flow.tsx",
    screenTargets: [
      "src/components/screens/referral-invite.tsx",
      "src/components/screens/referral-share.tsx",
      "src/components/screens/referral-reward.tsx",
    ],
    imports: [
      "@/components/screens/referral-invite",
      "@/components/screens/referral-share",
      "@/components/screens/referral-reward",
    ],
    blocks: [
      { item: "form-layout-react", target: "src/components/blocks/form-layout.tsx" },
      { item: "share-invite-react", target: "src/components/blocks/share-invite.tsx" },
      { item: "kpi-card-react", target: "src/components/blocks/kpi-card.tsx" },
    ],
  },
  {
    framework: "vue",
    target: "src/components/flows/ReferralFlow.vue",
    screenTargets: [
      "src/components/screens/ReferralInvite.vue",
      "src/components/screens/ReferralShare.vue",
      "src/components/screens/ReferralReward.vue",
    ],
    imports: [
      "@/components/screens/ReferralInvite.vue",
      "@/components/screens/ReferralShare.vue",
      "@/components/screens/ReferralReward.vue",
    ],
    blocks: [
      { item: "form-layout-vue", target: "src/components/blocks/FormLayout.vue" },
      { item: "share-invite-vue", target: "src/components/blocks/ShareInvite.vue" },
      { item: "kpi-card-vue", target: "src/components/blocks/KpiCard.vue" },
    ],
  },
  {
    framework: "svelte",
    target: "src/components/flows/ReferralFlow.svelte",
    screenTargets: [
      "src/components/screens/ReferralInvite.svelte",
      "src/components/screens/ReferralShare.svelte",
      "src/components/screens/ReferralReward.svelte",
    ],
    imports: [
      "@/components/screens/ReferralInvite.svelte",
      "@/components/screens/ReferralShare.svelte",
      "@/components/screens/ReferralReward.svelte",
    ],
    blocks: [
      { item: "form-layout-svelte", target: "src/components/blocks/FormLayout.svelte" },
      { item: "share-invite-svelte", target: "src/components/blocks/ShareInvite.svelte" },
      { item: "kpi-card-svelte", target: "src/components/blocks/KpiCard.svelte" },
    ],
  },
  {
    framework: "solid",
    target: "src/components/flows/referral-flow.tsx",
    screenTargets: [
      "src/components/screens/referral-invite.tsx",
      "src/components/screens/referral-share.tsx",
      "src/components/screens/referral-reward.tsx",
    ],
    imports: [
      "@/components/screens/referral-invite",
      "@/components/screens/referral-share",
      "@/components/screens/referral-reward",
    ],
    blocks: [
      { item: "form-layout-solid", target: "src/components/blocks/form-layout.tsx" },
      { item: "share-invite-solid", target: "src/components/blocks/share-invite.tsx" },
      { item: "kpi-card-solid", target: "src/components/blocks/kpi-card.tsx" },
    ],
  },
];

const project = useFreshProject();

describe("moderno add referral-<framework>", () => {
  for (const variant of variants) {
    const flow = `referral-${variant.framework}`;

    it(`installs ${flow}, its three screens and the block each one composes`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({ registry, projectDir: project(), name: flow, manifest });

      // Deepest first: each block right before the screen that imports it, the
      // assembly after all three screens.
      expect(result.installed).toEqual([
        ...SCREENS.flatMap((screen, index) => [
          variant.blocks[index]!.item,
          `${screen}-${variant.framework}`,
        ]),
        flow,
      ]);

      // The assembly composes the three screens from where `add` just put them.
      const assembly = await readFile(join(project(), variant.target), "utf8");
      for (const specifier of variant.imports) expect(assembly).toContain(specifier);

      // Every screen and every block is on disk as its own file, not inlined.
      for (const target of [...variant.screenTargets, ...variant.blocks.map((b) => b.target)]) {
        expect((await readFile(join(project(), target), "utf8")).length).toBeGreaterThan(0);
      }

      // Per item, not per flow: `moderno update referral-share-react` stays possible.
      const recorded = await readManifest(project());
      expect(recorded.items[flow]!.type).toBe("registry:flow");
      expect(recorded.items[flow]!.version).toBe(registry.getItem(flow)!.version);
      expect(recorded.items[flow]!.files[0]!.target).toBe(variant.target);
      for (const [index, screen] of SCREENS.entries()) {
        const name = `${screen}-${variant.framework}`;
        expect(recorded.items[name]!.type).toBe("registry:screen");
        expect(recorded.items[name]!.version).toBe(registry.getItem(name)!.version);
        expect(recorded.items[name]!.files[0]!.target).toBe(variant.screenTargets[index]);
      }
      for (const block of variant.blocks) {
        expect(recorded.items[block.item]!.type).toBe("registry:block");
        expect(recorded.items[block.item]!.version).toBe(registry.getItem(block.item)!.version);
        expect(recorded.items[block.item]!.files[0]!.target).toBe(block.target);
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

      // …and the untouched items in the same tree still move on their own.
      for (const screen of SCREENS) {
        const screenUpdate = await updateItem({
          registry,
          projectDir: project(),
          name: `${screen}-${variant.framework}`,
          manifest: installed,
        });
        expect(screenUpdate.status).toBe("up-to-date");
        expect(screenUpdate.files.every((file) => file.status !== "skipped-edited")).toBe(true);
      }
      expect(await readFile(assemblyFile, "utf8")).toBe(edited);
    });
  }

  it("declares its screens as registry dependencies and nothing else", async () => {
    const registry = await createRegistry(registryDir).load();
    for (const variant of variants) {
      const entry = registry.getItem(`referral-${variant.framework}`)!;
      expect(entry.type).toBe("registry:flow");
      expect(entry.registryDependencies).toEqual(
        SCREENS.map((screen) => `${screen}-${variant.framework}`),
      );
      // A flow is one file — the assembly — and composes screens only; the
      // blocks and the primitives arrive through them.
      expect(entry.files).toHaveLength(1);
      expect(entry.dependencies).toEqual([]);
    }
  });

  it("installs a screen without the flow it belongs to", async () => {
    const registry = await createRegistry(registryDir).load();
    const manifest = await readManifest(project());
    const result = await addItem({
      registry,
      projectDir: project(),
      name: "referral-share-react",
      manifest,
    });
    expect(result.installed).not.toContain("referral-react");
    expect((await readManifest(project())).items["referral-react"]).toBeUndefined();
  });
});
