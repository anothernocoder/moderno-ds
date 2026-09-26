import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { NAVIGATE_CALL, registryDir, useFreshProject } from "./fresh-project.ts";

const project = useFreshProject();

describe("moderno add sign-up-<framework>", () => {
  /** Screens are authored in all four frameworks, one registry item each. */
  const variants = [
    {
      item: "sign-up-react",
      target: "src/components/screens/sign-up.tsx",
      block: { item: "login-form-react", target: "src/components/blocks/login-form.tsx" },
      import: "@/components/blocks/login-form",
    },
    {
      item: "sign-up-vue",
      target: "src/components/screens/SignUp.vue",
      block: { item: "login-form-vue", target: "src/components/blocks/LoginForm.vue" },
      import: "@/components/blocks/LoginForm.vue",
    },
    {
      item: "sign-up-svelte",
      target: "src/components/screens/SignUp.svelte",
      block: { item: "login-form-svelte", target: "src/components/blocks/LoginForm.svelte" },
      import: "@/components/blocks/LoginForm.svelte",
    },
    {
      item: "sign-up-solid",
      target: "src/components/screens/sign-up.tsx",
      block: { item: "login-form-solid", target: "src/components/blocks/login-form.tsx" },
      import: "@/components/blocks/login-form",
    },
  ];

  for (const variant of variants) {
    it(`installs ${variant.item} and the card it composes into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project());
      const result = await addItem({
        registry,
        projectDir: project(),
        name: variant.item,
        manifest,
      });

      // Deepest first: the block is written before the screen that imports it.
      expect(result.installed).toEqual([variant.block.item, variant.item]);

      const written = await readFile(join(project(), variant.target), "utf8");
      expect(written).toContain(variant.import);
      // …owns the viewport as a height, not as a set of breakpoints…
      expect(written).toContain("min-h-dvh");
      // …and reads every width off its own container, all three steps (ADR-0005).
      expect(written).toContain("@container");
      expect(written).toContain("@sm:");
      expect(written).toContain("@md:");
      expect(written).toContain("@lg:");
      expect(written).not.toContain("@media");

      // Every link the screen draws itself hands the click event back with the
      // destination, or the `preventDefault()` the docs promise a router is
      // unwritable: a consumer would get the callback *and* a full document
      // navigation on every masthead and footer link. Vue emits `navigate`;
      // the other three call `onNavigate`.
      const navigateCalls = written.match(NAVIGATE_CALL) ?? [];
      expect(navigateCalls).toHaveLength(4);
      for (const call of navigateCalls) expect(call).toContain("event");

      // The screen mounts the shared card in its account-creation mode, and the
      // card that landed beside it understands that mode: the two halves of the
      // promise this screen makes, held against the bytes the CLI wrote.
      expect(written).toContain('mode="sign-up"');
      const card = await readFile(join(project(), variant.block.target), "utf8");
      expect(card).toContain("@container");
      expect(card).toContain('"sign-up"');
      // The consent box only an account creation asks for, under its own name.
      expect(card).toContain('name="terms"');

      const recorded = await readManifest(project());
      expect(recorded.items[variant.item]!.type).toBe("registry:screen");
      expect(recorded.items[variant.item]!.version).toBe(registry.getItem(variant.item)!.version);
      expect(recorded.items[variant.item]!.files[0]!.target).toBe(variant.target);
      // Per item, not per screen: `moderno update login-form-react` stays possible,
      // and sign-in and sign-up share the one installed copy of the card.
      expect(recorded.items[variant.block.item]!.type).toBe("registry:block");
      expect(recorded.items[variant.block.item]!.version).toBe(
        registry.getItem(variant.block.item)!.version,
      );
    });
  }

  it("declares the card as its only registry dependency and pulls in no flow", async () => {
    const registry = await createRegistry(registryDir).load();
    for (const variant of variants) {
      const entry = registry.getItem(variant.item)!;
      expect(entry.type).toBe("registry:screen");
      expect(entry.dependencies).toEqual([`@moderno-ui/${variant.item.split("-").pop()}`]);
      expect(entry.registryDependencies).toEqual([variant.block.item]);
      // A screen is one file; what it composes arrives as its own item.
      expect(entry.files).toHaveLength(1);
    }
  });
});
