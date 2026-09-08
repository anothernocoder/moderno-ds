import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readManifest } from "../src/manifest.ts";
import { addItem } from "../src/operations.ts";
import { createRegistry } from "../src/registry.ts";

/**
 * `moderno add <screen>` against the **real** catalog, into a temp project.
 *
 * `tiers-install.test.ts` proves transitive composition on a synthetic fixture
 * and `blocks-install.test.ts` proves the one-file block case on the shipped
 * registry; this is the tier the two meet at — a `registry:screen` whose
 * `registryDependencies` are the blocks it composes, installed by the command a
 * consumer actually types. What it holds the catalog to is the promise the
 * screens page makes: one command puts the screen *and* its blocks on disk,
 * each recorded under its own version, and the screen's source imports them
 * from where they landed.
 */
const registryDir = fileURLToPath(new URL("../../../registry", import.meta.url));

let project: string;
beforeEach(async () => {
  project = await mkdtemp(join(tmpdir(), "moderno-proj-"));
});
afterEach(async () => {
  await rm(project, { recursive: true, force: true });
});

describe("moderno add sign-up-<framework>", () => {
  /** React and Svelte are the two frameworks screens are authored in (spec #69). */
  const variants = [
    {
      item: "sign-up-react",
      target: "src/components/screens/sign-up.tsx",
      block: { item: "login-form-react", target: "src/components/blocks/login-form.tsx" },
      import: "@/components/blocks/login-form",
    },
    {
      item: "sign-up-svelte",
      target: "src/components/screens/SignUp.svelte",
      block: { item: "login-form-svelte", target: "src/components/blocks/LoginForm.svelte" },
      import: "@/components/blocks/LoginForm.svelte",
    },
  ];

  for (const variant of variants) {
    it(`installs ${variant.item} and the card it composes into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project);
      const result = await addItem({
        registry,
        projectDir: project,
        name: variant.item,
        manifest,
      });

      // Deepest first: the block is written before the screen that imports it.
      expect(result.installed).toEqual([variant.block.item, variant.item]);

      const written = await readFile(join(project, variant.target), "utf8");
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
      // navigation on every masthead and footer link.
      const navigateCalls = written.match(/on[Nn]avigate\?\.\([^)]*\)/g) ?? [];
      expect(navigateCalls).toHaveLength(4);
      for (const call of navigateCalls) expect(call).toContain("event");

      // The screen mounts the shared card in its account-creation mode, and the
      // card that landed beside it understands that mode: the two halves of the
      // promise this screen makes, held against the bytes the CLI wrote.
      expect(written).toContain('mode="sign-up"');
      const card = await readFile(join(project, variant.block.target), "utf8");
      expect(card).toContain("@container");
      expect(card).toContain('"sign-up"');
      // The consent box only an account creation asks for, under its own name.
      expect(card).toContain('name="terms"');

      const recorded = await readManifest(project);
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

describe("moderno add sign-in-<framework>", () => {
  /** React and Svelte are the two frameworks screens are authored in (spec #69). */
  const variants = [
    {
      item: "sign-in-react",
      target: "src/components/screens/sign-in.tsx",
      blocks: [
        { item: "login-form-react", target: "src/components/blocks/login-form.tsx" },
        { item: "alert-list-react", target: "src/components/blocks/alert-list.tsx" },
      ],
      imports: ["@/components/blocks/login-form", "@/components/blocks/alert-list"],
    },
    {
      item: "sign-in-svelte",
      target: "src/components/screens/SignIn.svelte",
      blocks: [
        { item: "login-form-svelte", target: "src/components/blocks/LoginForm.svelte" },
        { item: "alert-list-svelte", target: "src/components/blocks/AlertList.svelte" },
      ],
      imports: ["@/components/blocks/LoginForm.svelte", "@/components/blocks/AlertList.svelte"],
    },
  ];

  for (const { item, target, blocks, imports } of variants) {
    it(`installs ${item} and the blocks it composes into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project);
      const result = await addItem({ registry, projectDir: project, name: item, manifest });

      // Deepest first: the blocks are written before the screen that imports them.
      expect(result.installed).toEqual([...blocks.map((b) => b.item), item]);

      const written = await readFile(join(project, target), "utf8");
      // The screen composes the two blocks from where `add` just put them…
      for (const specifier of imports) expect(written).toContain(specifier);
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
      // navigation on every masthead and footer link.
      const navigateCalls = written.match(/on[Nn]avigate\?\.\([^)]*\)/g) ?? [];
      expect(navigateCalls).toHaveLength(4);
      for (const call of navigateCalls) expect(call).toContain("event");

      // Each block is on disk as its own file, not inlined into the screen.
      for (const block of blocks) {
        expect(await readFile(join(project, block.target), "utf8")).toContain("@container");
      }

      const recorded = await readManifest(project);
      expect(recorded.items[item]!.type).toBe("registry:screen");
      expect(recorded.items[item]!.version).toBe(registry.getItem(item)!.version);
      expect(recorded.items[item]!.files[0]!.target).toBe(target);
      // Per item, not per screen: `moderno update login-form-react` stays possible.
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

describe("moderno add forgot-password-<framework>", () => {
  /** React and Svelte are the two frameworks screens are authored in (spec #69). */
  const variants = [
    {
      item: "forgot-password-react",
      target: "src/components/screens/forgot-password.tsx",
      blocks: [
        { item: "login-form-react", target: "src/components/blocks/login-form.tsx" },
        { item: "alert-list-react", target: "src/components/blocks/alert-list.tsx" },
      ],
      imports: ["@/components/blocks/login-form", "@/components/blocks/alert-list"],
      card: "src/components/blocks/login-form.tsx",
    },
    {
      item: "forgot-password-svelte",
      target: "src/components/screens/ForgotPassword.svelte",
      blocks: [
        { item: "login-form-svelte", target: "src/components/blocks/LoginForm.svelte" },
        { item: "alert-list-svelte", target: "src/components/blocks/AlertList.svelte" },
      ],
      imports: ["@/components/blocks/LoginForm.svelte", "@/components/blocks/AlertList.svelte"],
      card: "src/components/blocks/LoginForm.svelte",
    },
  ];

  for (const { item, target, blocks, imports, card } of variants) {
    it(`installs ${item} and the blocks it composes into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project);
      const result = await addItem({ registry, projectDir: project, name: item, manifest });

      // Deepest first: the blocks are written before the screen that imports them.
      expect(result.installed).toEqual([...blocks.map((b) => b.item), item]);

      const written = await readFile(join(project, target), "utf8");
      // The screen composes the two blocks from where `add` just put them…
      for (const specifier of imports) expect(written).toContain(specifier);
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
      // navigation on every masthead and footer link.
      const navigateCalls = written.match(/on[Nn]avigate\?\.\([^)]*\)/g) ?? [];
      expect(navigateCalls).toHaveLength(4);
      for (const call of navigateCalls) expect(call).toContain("event");

      // The screen mounts the shared card in its recovery mode and hands it the
      // sent state; the card that landed beside it understands both.
      expect(written).toContain('mode="forgot-password"');
      const cardSource = await readFile(join(project, card), "utf8");
      expect(cardSource).toContain("@container");
      expect(cardSource).toContain('"forgot-password"');
      // The confirmation never says the address is known — that sentence is the
      // difference between a recovery card and an account-enumeration endpoint.
      expect(cardSource).toContain("has an account, a link to set a new password");
      // …and it resubmits the address from a hidden input, so "Send it again"
      // is a plain form submission on a page that never hydrated.
      expect(cardSource).toContain('type="hidden"');
      // The screen is the whole route, so the card's title is the page's `h1`:
      // the screen asks for that rank and the card that landed beside it knows
      // how to carry it. Without both halves the installed page opens with an
      // `h3` and no top-level heading at all.
      expect(written).toMatch(/title-?[Ll]evel[=:]?\s*[{"']?1/);
      expect(cardSource).toContain("titleLevel");
      expect(cardSource).toContain("aria-level");
      // The confirmation rewrites the header in place; the live region is the
      // only thing that tells a screen reader it happened.
      expect(cardSource).toContain('"status"');

      const recorded = await readManifest(project);
      expect(recorded.items[item]!.type).toBe("registry:screen");
      expect(recorded.items[item]!.version).toBe(registry.getItem(item)!.version);
      expect(recorded.items[item]!.files[0]!.target).toBe(target);
      // Per item, not per screen: sign-in, sign-up and forgot-password share the
      // one installed copy of the card, each recorded under its own version.
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

describe("moderno add reset-password-<framework>", () => {
  /** React and Svelte are the two frameworks screens are authored in (spec #69). */
  const variants = [
    {
      item: "reset-password-react",
      target: "src/components/screens/reset-password.tsx",
      blocks: [
        { item: "login-form-react", target: "src/components/blocks/login-form.tsx" },
        { item: "alert-list-react", target: "src/components/blocks/alert-list.tsx" },
      ],
      imports: ["@/components/blocks/login-form", "@/components/blocks/alert-list"],
      card: "src/components/blocks/login-form.tsx",
    },
    {
      item: "reset-password-svelte",
      target: "src/components/screens/ResetPassword.svelte",
      blocks: [
        { item: "login-form-svelte", target: "src/components/blocks/LoginForm.svelte" },
        { item: "alert-list-svelte", target: "src/components/blocks/AlertList.svelte" },
      ],
      imports: ["@/components/blocks/LoginForm.svelte", "@/components/blocks/AlertList.svelte"],
      card: "src/components/blocks/LoginForm.svelte",
    },
  ];

  for (const { item, target, blocks, imports, card } of variants) {
    it(`installs ${item} and the blocks it composes into a fresh project`, async () => {
      const registry = await createRegistry(registryDir).load();
      const manifest = await readManifest(project);
      const result = await addItem({ registry, projectDir: project, name: item, manifest });

      // Deepest first: the blocks are written before the screen that imports them.
      expect(result.installed).toEqual([...blocks.map((b) => b.item), item]);

      const written = await readFile(join(project, target), "utf8");
      // The screen composes the two blocks from where `add` just put them…
      for (const specifier of imports) expect(written).toContain(specifier);
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
      // navigation on every masthead and footer link.
      const navigateCalls = written.match(/on[Nn]avigate\?\.\([^)]*\)/g) ?? [];
      expect(navigateCalls).toHaveLength(4);
      for (const call of navigateCalls) expect(call).toContain("event");

      // The screen mounts the shared card in its reset mode, and the card that
      // landed beside it understands that mode.
      expect(written).toContain('mode="reset-password"');
      const cardSource = await readFile(join(project, card), "utf8");
      expect(cardSource).toContain("@container");
      expect(cardSource).toContain('"reset-password"');
      // A new password, twice — and no `current-password` field: whoever opened
      // this link does not have the old one to give.
      expect(cardSource).toContain('name="confirmPassword"');
      expect(cardSource).toContain("new-password");
      // The token rides in a hidden input inside the form, so the reset posts on
      // a page that never hydrated — the same argument as the resend's address.
      expect(cardSource).toContain('name="token"');
      expect(cardSource).toContain('type="hidden"');
      // The rules are the field's own helper text (that is what puts them in the
      // input's `aria-describedby`) and they are a polite live region, so the one
      // row that flips is announced rather than the whole list.
      expect(cardSource).toContain("requirements");
      expect(cardSource).toContain('aria-live="polite"');
      expect(cardSource).toContain('role="list"');
      // Never colour alone: each row says its status in words too.
      expect(cardSource).toContain("not met yet");
      // The screen is the whole route, so the card's title is the page's `h1`.
      expect(written).toMatch(/title-?[Ll]evel[=:]?\s*[{"']?1/);
      expect(cardSource).toContain("titleLevel");
      expect(cardSource).toContain("aria-level");

      const recorded = await readManifest(project);
      expect(recorded.items[item]!.type).toBe("registry:screen");
      expect(recorded.items[item]!.version).toBe(registry.getItem(item)!.version);
      expect(recorded.items[item]!.files[0]!.target).toBe(target);
      // Per item, not per screen: the four auth screens share the one installed
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
