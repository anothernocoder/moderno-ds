import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readManifest } from "../../src/manifest.ts";
import { addItem } from "../../src/operations.ts";
import { createRegistry } from "../../src/registry.ts";
import { NAVIGATE_CALL, registryDir, useFreshProject } from "./fresh-project.ts";

const project = useFreshProject();

describe("moderno add invite-team-<framework>", () => {
  /** Screens are authored in all four frameworks, one registry item each. */
  const variants = [
    {
      item: "invite-team-react",
      target: "src/components/screens/invite-team.tsx",
      blocks: [{ item: "list-react", target: "src/components/blocks/list.tsx" }],
      imports: ["@/components/blocks/list"],
    },
    {
      item: "invite-team-vue",
      target: "src/components/screens/InviteTeam.vue",
      blocks: [{ item: "list-vue", target: "src/components/blocks/List.vue" }],
      imports: ["@/components/blocks/List.vue"],
    },
    {
      item: "invite-team-svelte",
      target: "src/components/screens/InviteTeam.svelte",
      blocks: [{ item: "list-svelte", target: "src/components/blocks/List.svelte" }],
      imports: ["@/components/blocks/List.svelte"],
    },
    {
      item: "invite-team-solid",
      target: "src/components/screens/invite-team.tsx",
      blocks: [{ item: "list-solid", target: "src/components/blocks/list.tsx" }],
      imports: ["@/components/blocks/list"],
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
      // …takes the addresses in one email field that accepts several…
      expect(written).toContain('name="emails"');
      expect(written).toContain("multiple");
      // …owns the viewport as a height, not as a set of breakpoints…
      expect(written).toContain("min-h-dvh");
      // …and reads every width off its own container, its @sm and @md steps (ADR-0005).
      expect(written).toContain("@container");
      expect(written).toContain("@sm:");
      expect(written).toContain("@md:");
      expect(written).not.toContain("@media");

      // Every link the screen draws itself (wordmark, skip, privacy, terms)
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
      // Per item, not per screen: `moderno update list-react` stays possible.
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
