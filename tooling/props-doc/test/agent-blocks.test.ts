import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";
import { afterAll, describe, expect, it } from "vitest";
import {
  blockPropsHash,
  buildAgentBlocks,
  checkBlockDrift,
  listRegistryBlocks,
  resolveBlockProps,
  type AgentBlock,
} from "../src/agent-blocks.ts";
import { AGENT_COMPONENTS, buildComponentsManifest } from "../src/agent-manifest.ts";
import { BLOCK_PROPS_HASHES } from "../src/blocks.generated.ts";
import { readAgentGuidance } from "../src/mdx-frontmatter.ts";

const repoRoot = fileURLToPath(new URL("../../..", import.meta.url));
const blocks = listRegistryBlocks(repoRoot);
/** The one block extraction this file runs: everything below reads it. */
const resolvedProps = resolveBlockProps(blocks, repoRoot);
const guidance = Object.fromEntries(
  blocks.map((b) => [
    b.name,
    readAgentGuidance(join(repoRoot, "apps/docs/src/content/docs/en", `${b.slug}.mdx`)),
  ]),
);
const reactBlocks = buildAgentBlocks({
  repoRoot,
  framework: "react",
  blocks,
  resolvedProps,
  primitives: AGENT_COMPONENTS.map((c) => c.name),
  guidance,
});
const bySlug = new Map(reactBlocks.map((b) => [b.slug, b]));

function block(slug: string): AgentBlock {
  const found = bySlug.get(slug);
  if (!found) throw new Error(`no block ${slug}`);
  return found;
}

describe("Blocks in moderno.agent.json (react)", () => {
  it("lists every registry block, by its folder", () => {
    const folders = readdirSync(join(repoRoot, "registry/blocks")).sort();
    expect(reactBlocks.map((b) => b.slug)).toEqual(folders);
  });

  it("gives every block its props, install command, frameworks and the registry item as example", () => {
    for (const b of reactBlocks) {
      expect(b.kind).toBe("block");
      expect(b.props.length, b.slug).toBeGreaterThan(0);
      expect(b.install).toBe(`npx @moderno-ui/cli add ${b.slug}-react`);
      expect(b.frameworks).toContain("react");
      expect(b.description).not.toContain("{framework}");
      const source = readFileSync(
        join(repoRoot, blocks.find((r) => r.slug === b.slug)!.sources.react!),
        "utf8",
      );
      expect(b.examples).toEqual([{ title: expect.any(String), code: source }]);
    }
  });

  it("expands KpiCard's metric into the fields of KpiCardMetric", () => {
    const kpi = block("kpi-card");
    expect(kpi.name).toBe("KpiCard");
    expect(kpi.props.find((p) => p.name === "metric")).toMatchObject({
      type: "KpiCardMetric | null",
      required: false,
    });
    expect(kpi.shapes.KpiCardMetric).toEqual([
      { name: "caption", type: "string", required: false },
      { name: "delta", type: "string", required: false },
      { name: "tone", type: '"negative" | "neutral" | "positive"', required: false },
      { name: "trend", type: "number[]", required: false },
      { name: "value", type: "string", required: true },
    ]);
    expect(kpi.composes).toEqual(["Alert", "Badge", "Button", "Card", "Skeleton", "SparkChart"]);
  });

  it("expands nested shapes: an order item's image", () => {
    const order = block("order-summary");
    expect(Object.keys(order.shapes).sort()).toEqual(["OrderItem", "OrderItemImage", "OrderTotal"]);
    expect(order.shapes.OrderItem).toContainEqual({
      name: "image",
      type: "OrderItemImage",
      required: false,
    });
  });

  it.each([
    "kpi-card",
    "stat-row",
    "order-summary",
    "table",
    "alert-list",
    "form-layout",
    "checkout-form",
    "input-group",
    "login-form",
  ])("carries %s's agent: guidance, with whenNotToUse and gotchas", (slug) => {
    const { guidance } = block(slug);
    expect(guidance?.intent).toBeTruthy();
    expect(guidance?.whenToUse).toBeTruthy();
    expect(guidance?.whenNotToUse?.length).toBeGreaterThan(0);
    expect(guidance?.gotchas?.length).toBeGreaterThan(0);
  });

  it("validates against moderno.agent.schema.json inside a components manifest", () => {
    const schema = JSON.parse(
      readFileSync(join(repoRoot, "docs/prd/phase-7/moderno.agent.schema.json"), "utf8"),
    );
    const validate = new Ajv({ allowUnionTypes: true }).compile(schema);
    const manifest = buildComponentsManifest({
      packageName: "@moderno-ui/react",
      version: "0.1.0",
      framework: "react",
      reactTsConfigFilePath: join(repoRoot, "packages/react/tsconfig.json"),
      components: [],
      guidance: {},
      blocks: reactBlocks,
    });
    expect(validate(manifest), JSON.stringify(validate.errors)).toBe(true);
  });
});

describe("block drift", () => {
  const current = Object.fromEntries(
    blocks.map((b) => [b.slug, blockPropsHash(resolvedProps.get(b.slug))]),
  );
  const scratch = mkdtempSync(join(tmpdir(), "moderno-block-drift-"));
  afterAll(() => rmSync(scratch, { recursive: true, force: true }));

  it("passes when pnpm gen recorded the current props", () => {
    expect(checkBlockDrift(BLOCK_PROPS_HASHES, current)).toEqual([]);
  });

  it("fails when a block's Props interface changes without pnpm gen", () => {
    const kpi = blocks.find((b) => b.slug === "kpi-card")!;
    const changed = join(scratch, "kpi-card.tsx");
    writeFileSync(
      changed,
      readFileSync(join(repoRoot, kpi.sources.react!), "utf8").replace(
        "export interface KpiCardProps {",
        "export interface KpiCardProps {\n  footnote?: string;",
      ),
    );
    const tsconfig = join(scratch, "tsconfig.json");
    writeFileSync(
      tsconfig,
      JSON.stringify({
        extends: join(repoRoot, "tooling/props-doc/tsconfig.blocks.json"),
        include: [changed],
      }),
    );

    const doc = resolveBlockProps([{ ...kpi, sources: { react: changed } }], repoRoot, tsconfig);
    expect(doc.get("kpi-card")?.props.map((p) => p.name)).toContain("footnote");
    const issues = checkBlockDrift(BLOCK_PROPS_HASHES, {
      ...current,
      "kpi-card": blockPropsHash(doc.get("kpi-card")),
    });
    expect(issues).toEqual([{ slug: "kpi-card", reason: "props-changed" }]);
  });

  it("fails for a new block pnpm gen has not seen, and a deleted one it still lists", () => {
    expect(checkBlockDrift({ old: "sha256:a" }, { fresh: "sha256:b" })).toEqual([
      { slug: "fresh", reason: "not-generated" },
      { slug: "old", reason: "removed" },
    ]);
  });
});
