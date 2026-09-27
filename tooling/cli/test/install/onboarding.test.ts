import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem, updateItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { registryDir, useFreshProject } from "./fresh-project.ts";

/**
 * `moderno add onboarding-<framework>` against the **real** catalog, into a
 * temp project: the flow, its four screens and the block each screen composes,
 * each recorded under its own version — and, once the assembly is edited,
 * `update` leaves it alone while the screens beside it still move.
 */

/** The onboarding flow's screens, in the order the catalog declares them, each with the block it composes. */
const SCREENS = [
  { screen: "welcome", block: "hero" },
  { screen: "profile-setup", block: "form-layout" },
  { screen: "plan-select", block: "pricing" },
  { screen: "invite-team", block: "list" },
] as const;

interface Variant {
  framework: string;
  /** Where the assembly lands in the consumer project. */
  target: string;
  /** The four screen files, in `SCREENS` order. */
  screenTargets: string[];
  /** The specifiers the assembly imports its screens through. */
  imports: string[];
  /** The four block files, in `SCREENS` order. */
  blockTargets: string[];
}

/** Flows are authored in all four frameworks, one registry item each. */
const variants: Variant[] = [
  {
    framework: "react",
    target: "src/components/flows/onboarding-flow.tsx",
    screenTargets: [
      "src/components/screens/welcome.tsx",
      "src/components/screens/profile-setup.tsx",
      "src/components/screens/plan-select.tsx",
      "src/components/screens/invite-team.tsx",
    ],
    imports: [
      "@/components/screens/welcome",
      "@/components/screens/profile-setup",
      "@/components/screens/plan-select",
      "@/components/screens/invite-team",
    ],
    blockTargets: [
      "src/components/blocks/hero.tsx",
      "src/components/blocks/form-layout.tsx",
      "src/components/blocks/pricing.tsx",
      "src/components/blocks/list.tsx",
    ],
  },
  {
    framework: "vue",
    target: "src/components/flows/OnboardingFlow.vue",
    screenTargets: [
      "src/components/screens/Welcome.vue",
      "src/components/screens/ProfileSetup.vue",
      "src/components/screens/PlanSelect.vue",
      "src/components/screens/InviteTeam.vue",
    ],
    imports: [
      "@/components/screens/Welcome.vue",
      "@/components/screens/ProfileSetup.vue",
      "@/components/screens/PlanSelect.vue",
      "@/components/screens/InviteTeam.vue",
    ],
    blockTargets: [
      "src/components/blocks/Hero.vue",
      "src/components/blocks/FormLayout.vue",
      "src/components/blocks/Pricing.vue",
      "src/components/blocks/List.vue",
    ],
  },
  {
    framework: "svelte",
    target: "src/components/flows/OnboardingFlow.svelte",
    screenTargets: [
      "src/components/screens/Welcome.svelte",
      "src/components/screens/ProfileSetup.svelte",
      "src/components/screens/PlanSelect.svelte",
      "src/components/screens/InviteTeam.svelte",
    ],
    imports: [
      "@/components/screens/Welcome.svelte",
      "@/components/screens/ProfileSetup.svelte",
      "@/components/screens/PlanSelect.svelte",
      "@/components/screens/InviteTeam.svelte",
    ],
    blockTargets: [
      "src/components/blocks/Hero.svelte",
      "src/components/blocks/FormLayout.svelte",
      "src/components/blocks/Pricing.svelte",
      "src/components/blocks/List.svelte",
    ],
  },
  {
    framework: "solid",
    target: "src/components/flows/onboarding-flow.tsx",
    screenTargets: [
      "src/components/screens/welcome.tsx",
      "src/components/screens/profile-setup.tsx",
      "src/components/screens/plan-select.tsx",
      "src/components/screens/invite-team.tsx",
    ],
    imports: [
      "@/components/screens/welcome",
      "@/components/screens/profile-setup",
      "@/components/screens/plan-select",
      "@/components/screens/invite-team",
    ],
    blockTargets: [
      "src/components/blocks/hero.tsx",
      "src/components/blocks/form-layout.tsx",
      "src/components/blocks/pricing.tsx",
      "src/components/blocks/list.tsx",
    ],
  },
];

const project = useFreshProject();

describe("moderno add onboarding-<framework>", () => {
  for (const variant of variants) {
    const flow = `onboarding-${variant.framework}`;
    const itemFor = (name: string) => `${name}-${variant.framework}`;

    it(`installs ${flow}, its four screens and their blocks`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({ registry, projectDir: project(), name: flow, manifest });

      // Deepest first: each block is written before the screen that imports it,
      // each screen before the flow, and every item exactly once.
      expect(result.installed).toEqual([
        ...SCREENS.flatMap(({ screen, block }) => [itemFor(block), itemFor(screen)]),
        flow,
      ]);

      // The assembly composes the four screens from where `add` just put them.
      const assembly = await readFile(join(project(), variant.target), "utf8");
      for (const specifier of variant.imports) expect(assembly).toContain(specifier);

      // Every screen and every block is on disk as its own file, not inlined.
      for (const target of [...variant.screenTargets, ...variant.blockTargets]) {
        expect((await readFile(join(project(), target), "utf8")).length).toBeGreaterThan(0);
      }

      // Per item, not per flow: each is recorded under its own type and version.
      const recorded = await readManifest(project());
      expect(recorded.items[flow]!.type).toBe("registry:flow");
      expect(recorded.items[flow]!.version).toBe(registry.getItem(flow)!.version);
      expect(recorded.items[flow]!.files[0]!.target).toBe(variant.target);
      for (const [index, { screen, block }] of SCREENS.entries()) {
        const name = itemFor(screen);
        expect(recorded.items[name]!.type).toBe("registry:screen");
        expect(recorded.items[name]!.version).toBe(registry.getItem(name)!.version);
        expect(recorded.items[name]!.files[0]!.target).toBe(variant.screenTargets[index]);
        const blockName = itemFor(block);
        expect(recorded.items[blockName]!.type).toBe("registry:block");
        expect(recorded.items[blockName]!.version).toBe(registry.getItem(blockName)!.version);
        expect(recorded.items[blockName]!.files[0]!.target).toBe(variant.blockTargets[index]);
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

      // …and the untouched screens in the same tree still update on their own.
      for (const { screen } of SCREENS) {
        const screenUpdate = await updateItem({
          registry,
          projectDir: project(),
          name: itemFor(screen),
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
      const entry = registry.getItem(`onboarding-${variant.framework}`)!;
      expect(entry.type).toBe("registry:flow");
      expect(entry.registryDependencies).toEqual(
        SCREENS.map(({ screen }) => `${screen}-${variant.framework}`),
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
      name: "plan-select-react",
      manifest,
    });
    expect(result.installed).not.toContain("onboarding-react");
    expect((await readManifest(project())).items["onboarding-react"]).toBeUndefined();
  });
});
