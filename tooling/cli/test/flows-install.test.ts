import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readManifest } from "../src/manifest.ts";
import { addItem, updateItem } from "../src/operations.ts";
import { createRegistry } from "../src/registry.ts";

/**
 * `moderno add <flow>` against the **real** catalog, into a temp project.
 *
 * This is the top of the tier ladder and the one command that has to resolve
 * two levels of composition at once: a `registry:flow` whose
 * `registryDependencies` are its screens, each of whose `registryDependencies`
 * are the blocks it composes. `screens-install.test.ts` holds the level below;
 * what is held here is the promise the flows page makes — one command puts the
 * assembly, its five screens and the blocks they share on disk, each recorded
 * under its own version, with **one** copy of a block five screens all import.
 *
 * The second half is the reason per-item manifest entries exist at all: after a
 * consumer edits the assembly (which the flow exists to be edited), `update` on
 * a screen still moves that screen and leaves the edited file alone.
 */
const registryDir = fileURLToPath(new URL("../../../registry", import.meta.url));

/** The auth flow's screens, in the order the catalog declares them. */
const SCREENS = ["sign-in", "sign-up", "forgot-password", "reset-password", "verify"] as const;

interface Variant {
  framework: string;
  /** Where the assembly lands in the consumer project. */
  target: string;
  /** The five screen files, in `SCREENS` order. */
  screenTargets: string[];
  /** The specifiers the assembly imports its screens through. */
  imports: string[];
  /** The two blocks every auth screen shares, and where they land. */
  blocks: Array<{ item: string; target: string }>;
}

/** React and Svelte are the two frameworks flows are authored in (spec #69). */
const variants: Variant[] = [
  {
    framework: "react",
    target: "src/components/flows/auth-flow.tsx",
    screenTargets: [
      "src/components/screens/sign-in.tsx",
      "src/components/screens/sign-up.tsx",
      "src/components/screens/forgot-password.tsx",
      "src/components/screens/reset-password.tsx",
      "src/components/screens/verify.tsx",
    ],
    imports: [
      "@/components/screens/sign-in",
      "@/components/screens/sign-up",
      "@/components/screens/forgot-password",
      "@/components/screens/reset-password",
      "@/components/screens/verify",
    ],
    blocks: [
      { item: "login-form-react", target: "src/components/blocks/login-form.tsx" },
      { item: "alert-list-react", target: "src/components/blocks/alert-list.tsx" },
    ],
  },
  {
    framework: "svelte",
    target: "src/components/flows/AuthFlow.svelte",
    screenTargets: [
      "src/components/screens/SignIn.svelte",
      "src/components/screens/SignUp.svelte",
      "src/components/screens/ForgotPassword.svelte",
      "src/components/screens/ResetPassword.svelte",
      "src/components/screens/Verify.svelte",
    ],
    imports: [
      "@/components/screens/SignIn.svelte",
      "@/components/screens/SignUp.svelte",
      "@/components/screens/ForgotPassword.svelte",
      "@/components/screens/ResetPassword.svelte",
      "@/components/screens/Verify.svelte",
    ],
    blocks: [
      { item: "login-form-svelte", target: "src/components/blocks/LoginForm.svelte" },
      { item: "alert-list-svelte", target: "src/components/blocks/AlertList.svelte" },
    ],
  },
];

let project: string;
beforeEach(async () => {
  project = await mkdtemp(join(tmpdir(), "moderno-proj-"));
});
afterEach(async () => {
  await rm(project, { recursive: true, force: true });
});

describe("moderno add auth-<framework>", () => {
  for (const variant of variants) {
    const flow = `auth-${variant.framework}`;

    it(`installs ${flow}, its five screens and the blocks they share`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project);
      const result = await addItem({ registry, projectDir: project, name: flow, manifest });

      // Deepest first, and each item exactly once however many screens want it:
      // the two shared blocks are written before the first screen that imports
      // them and are not written again for the four screens after it.
      expect(result.installed.filter((name) => name === variant.blocks[0]!.item)).toHaveLength(1);
      expect(result.installed).toEqual([
        variant.blocks[0]!.item,
        variant.blocks[1]!.item,
        ...SCREENS.map((screen) => `${screen}-${variant.framework}`),
        flow,
      ]);

      // The assembly composes the five screens from where `add` just put them.
      const assembly = await readFile(join(project, variant.target), "utf8");
      for (const specifier of variant.imports) expect(assembly).toContain(specifier);

      // Every screen and every block is on disk as its own file, not inlined.
      for (const target of [...variant.screenTargets, ...variant.blocks.map((b) => b.target)]) {
        expect((await readFile(join(project, target), "utf8")).length).toBeGreaterThan(0);
      }

      // Per item, not per flow: `moderno update verify-react` stays possible,
      // and the five screens share the one installed copy of the card.
      const recorded = await readManifest(project);
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
        expect(recorded.items[block.item]!.files).toHaveLength(1);
      }
    });

    it(`leaves an edited ${flow} alone while updating the screen beside it`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project);
      await addItem({ registry, projectDir: project, name: flow, manifest });

      // The assembly is the file the flow exists to have rewritten.
      const assemblyFile = join(project, variant.target);
      const edited = `${await readFile(assemblyFile, "utf8")}\n// wired to our own router\n`;
      await writeFile(assemblyFile, edited);

      const installed = await readManifest(project);
      const screen = `${SCREENS[4]}-${variant.framework}`;

      const flowUpdate = await updateItem({
        registry,
        projectDir: project,
        name: flow,
        manifest: installed,
      });
      expect(flowUpdate.status).toBe("skipped-edited");
      expect(await readFile(assemblyFile, "utf8")).toBe(edited);

      // …and the untouched items in the same tree still move on their own.
      const screenUpdate = await updateItem({
        registry,
        projectDir: project,
        name: screen,
        manifest: installed,
      });
      expect(screenUpdate.status).toBe("up-to-date");
      expect(screenUpdate.files.every((file) => file.status !== "skipped-edited")).toBe(true);
      expect(await readFile(assemblyFile, "utf8")).toBe(edited);
    });
  }

  it("declares its screens as registry dependencies and nothing else", async () => {
    const registry = await createRegistry(registryDir).load();
    for (const variant of variants) {
      const entry = registry.getItem(`auth-${variant.framework}`)!;
      expect(entry.type).toBe("registry:flow");
      expect(entry.registryDependencies).toEqual(
        SCREENS.map((screen) => `${screen}-${variant.framework}`),
      );
      // A flow is one file — the assembly — and composes screens only; the
      // blocks and the primitives arrive through them.
      expect(entry.files).toHaveLength(1);
      // The assembly imports nothing from the design system itself: every
      // `@moderno-ui/*` package it needs is declared by a screen below it.
      expect(entry.dependencies).toEqual([]);
    }
  });

  it("installs a screen without the flow it belongs to", async () => {
    const registry = await createRegistry(registryDir).load();
    const manifest = await readManifest(project);
    const result = await addItem({
      registry,
      projectDir: project,
      name: "verify-react",
      manifest,
    });
    expect(result.installed).not.toContain("auth-react");
    expect((await readManifest(project)).items["auth-react"]).toBeUndefined();
  });
});
