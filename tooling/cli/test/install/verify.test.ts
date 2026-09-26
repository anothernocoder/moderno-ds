import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { NAVIGATE_CALL, registryDir, useFreshProject } from "./fresh-project.ts";

const project = useFreshProject();

describe("moderno add verify-<framework>", () => {
  /** Screens are authored in all four frameworks, one registry item each. */
  const variants = [
    {
      item: "verify-react",
      target: "src/components/screens/verify.tsx",
      blocks: [{ item: "login-form-react", target: "src/components/blocks/login-form.tsx" }],
      imports: ["@/components/blocks/login-form"],
      card: "src/components/blocks/login-form.tsx",
    },
    {
      item: "verify-vue",
      target: "src/components/screens/Verify.vue",
      blocks: [{ item: "login-form-vue", target: "src/components/blocks/LoginForm.vue" }],
      imports: ["@/components/blocks/LoginForm.vue"],
      card: "src/components/blocks/LoginForm.vue",
    },
    {
      item: "verify-svelte",
      target: "src/components/screens/Verify.svelte",
      blocks: [{ item: "login-form-svelte", target: "src/components/blocks/LoginForm.svelte" }],
      imports: ["@/components/blocks/LoginForm.svelte"],
      card: "src/components/blocks/LoginForm.svelte",
    },
    {
      item: "verify-solid",
      target: "src/components/screens/verify.tsx",
      blocks: [{ item: "login-form-solid", target: "src/components/blocks/login-form.tsx" }],
      imports: ["@/components/blocks/login-form"],
      card: "src/components/blocks/login-form.tsx",
    },
  ];

  for (const { item, target, blocks, imports, card } of variants) {
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

      // The screen mounts the shared card in its code mode, and the card that
      // landed beside it understands that mode.
      expect(written).toContain('mode="verify"');
      const cardSource = await readFile(join(project(), card), "utf8");
      expect(cardSource).toContain("@container");
      expect(cardSource).toContain('"verify"');
      // One name for the whole code, from Ark's hidden input — the cells carry
      // none — and `otp`, which is what asks the platform for the SMS autofill.
      expect(cardSource).toContain('name="code"');
      expect(cardSource).toContain("PinInput.HiddenInput");
      expect(cardSource).toContain("otp");
      // The resend is a second *submit* named `intent`, not a callback: that is
      // what makes it work on a page that never hydrated, and the address rides
      // beside the code for the same reason.
      expect(cardSource).toContain('name="intent"');
      expect(cardSource).toContain('value="resend"');
      expect(cardSource).toContain('name="email"');
      expect(cardSource).toContain('type="hidden"');
      // The countdown is rendered, never run: a block that owned a timer would
      // own state, and this one owns none.
      expect(cardSource).toContain("resendIn");
      expect(cardSource).not.toMatch(/setInterval|setTimeout/);
      // A wrong code is announced when it arrives, not merely printed.
      expect(cardSource).toContain('role="alert"');
      // The screen forwards what makes the code a code — how many cells, where
      // it went, and how long the resend is locked — rather than holding any of
      // it: the fields the rendered form actually submits are held by
      // `apps/docs/tests/e2e/verify-screen.spec.ts`, against the painted page.
      expect(written).toContain("codeLength");
      expect(written).toContain("sentTo");
      expect(written).toContain("resendIn");
      // The screen is the whole route, so the card's title is the page's `h1`.
      expect(written).toMatch(/title-?[Ll]evel[=:]?\s*[{"']?1/);
      expect(cardSource).toContain("titleLevel");
      expect(cardSource).toContain("aria-level");

      const recorded = await readManifest(project());
      expect(recorded.items[item]!.type).toBe("registry:screen");
      expect(recorded.items[item]!.version).toBe(registry.getItem(item)!.version);
      expect(recorded.items[item]!.files[0]!.target).toBe(target);
      // Per item, not per screen: the five auth screens share the one installed
      // copy of the card, each recorded under its own version.
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
