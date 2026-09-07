import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";
import {
  DOCS_TAILWIND_ENTRY,
  buildDocsTailwind,
  compileCandidates,
  extractCandidates,
} from "./tailwind.ts";

/**
 * The docs are where a block's container queries are shown to actually work, so
 * "the preview compiles the utilities blocks use" is a claim worth checking
 * rather than assuming — a silently-missed candidate would leave the preview
 * looking plausible and laid out wrong.
 */

const blockSources = [
  "../../../registry/blocks/pricing/svelte/Pricing.svelte",
  "../../../registry/blocks/pricing/react/pricing.tsx",
  "../../../registry/blocks/pricing/vue/Pricing.vue",
  "../../../registry/blocks/pricing/solid/pricing.tsx",
].map((path) => fileURLToPath(new URL(path, import.meta.url)));

const tokensCss = readFileSync(
  fileURLToPath(new URL("../../../packages/tokens/src/tokens.css", import.meta.url)),
  "utf8",
);

let css: string;

beforeAll(async () => {
  css = await buildDocsTailwind(blockSources);
});

describe("extractCandidates", () => {
  it("reads class attributes in all four dialects", () => {
    expect(extractCandidates('<div class="@container grid">')).toEqual(["@container", "grid"]);
    expect(extractCandidates('<div className="mt-6">')).toEqual(["mt-6"]);
    expect(extractCandidates("<div class:list={['p-6']}>")).toEqual(["p-6"]);
    expect(extractCandidates("<div className={`gap-4`}>")).toEqual(["gap-4"]);
  });

  it("ignores markup that is not a class attribute", () => {
    expect(extractCandidates('<a href="/en/blocks">grid</a>')).toEqual([]);
  });

  /**
   * ADR-0005 welcomes intrinsic layout ("an `auto-fit` grid is not a
   * breakpoint") and `no-hardcoded-dimension` names these as the escape hatch
   * for what the contract does not name — so the first block to take the ADR up
   * on it must not render in the preview with its grid quietly missing.
   */
  it("keeps an arbitrary value whole", () => {
    expect(
      extractCandidates(
        '<div class="grid-cols-[repeat(auto-fit,minmax(0,1fr))] bg-[url(/x.png)]">',
      ),
    ).toEqual(["bg-[url(/x.png)]", "grid-cols-[repeat(auto-fit,minmax(0,1fr))]"]);
    expect(extractCandidates('<div class="p-6 [&>*]:mt-0">')).toEqual(["[&>*]:mt-0", "p-6"]);
  });
});

describe("the docs Tailwind build compiles what blocks are written with", () => {
  it("emits the container-query variant at the contract width, not a viewport query", () => {
    expect(css).toContain("@container (width >= 36rem)");
    expect(css).not.toMatch(/@media[^{]*width/);
  });

  it("emits the layout utilities the pricing block uses", () => {
    for (const utility of ["grid", "gap-4", "p-6", "mt-6", "flex-col"]) {
      expect(css, utility).toMatch(new RegExp(`\\.${utility}\\s*\\{`));
    }
    // `@container` reaches the stylesheet CSS-escaped: `.\@container`.
    expect(css).toMatch(/\.\\@container\s*\{[^}]*container-type: inline-size/s);
  });

  it("keeps every colour utility pointed at a contract slot, so a theme re-skins the block", () => {
    expect(css).toMatch(/\.bg-card\s*\{[^}]*var\(--card\)/s);
    expect(css).toMatch(/\.text-muted-foreground\s*\{[^}]*var\(--muted-foreground\)/s);
    expect(css).toMatch(/\.rounded-lg\s*\{[^}]*var\(--radius\)/s);
    expect(css).toMatch(/\.shadow-sm\s*\{[^}]*var\(--shadow-sm\)/s);
  });

  it("skips preflight globally and scopes its block-facing subset to the preview panel", () => {
    // Tailwind's own reset would strip the docs prose; the subset a block is
    // written against is confined to the panel it is previewed in.
    expect(css).not.toMatch(/^\s*html,\s*:host\s*\{/m);
    for (const line of css.split("\n")) {
      if (line.includes("list-style") || line.includes("border: 0 solid")) {
        expect(css).toContain(".preview-panel--demo");
      }
    }
    expect(DOCS_TAILWIND_ENTRY).not.toContain("preflight");
  });

  /**
   * `@theme inline` re-declares contract slots as `--font-sans: var(--font-sans)`.
   * That is a cycle — and therefore an invalid value — unless something outside
   * `@layer theme` defines the same name. `tokens.css`'s unlayered `:root` is
   * what does, which is why the docs must load `@moderno-ui/css` alongside this.
   */
  it("self-references only slots tokens.css defines unlayered", () => {
    const selfReferenced = [...css.matchAll(/(--[\w-]+):\s*var\(\1\)/g)].map((m) => m[1]!);
    expect(selfReferenced.length).toBeGreaterThan(0);
    for (const slot of selfReferenced) {
      expect(tokensCss, `${slot} must be defined in tokens.css`).toContain(`${slot}:`);
    }
  });

  it("compiles the arbitrary values ADR-0005 blesses, end to end", async () => {
    const source = '<div class="grid-cols-[repeat(auto-fit,minmax(0,1fr))]">';
    const out = await compileCandidates(extractCandidates(source));
    expect(out).toContain("repeat(auto-fit,minmax(0,1fr))");
  });

  it("declares the layer order that puts a block's utilities above components.css", () => {
    const order = /@layer theme, moderno\.base, moderno\.components, utilities;/;
    expect(DOCS_TAILWIND_ENTRY).toMatch(order);
    expect(css).toMatch(order);
  });
});
