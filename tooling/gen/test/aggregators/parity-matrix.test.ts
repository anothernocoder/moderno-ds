import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import parityMatrix from "../../src/aggregators/parity-matrix.ts";

const FRAGMENTS_DIR = "docs/parity";

let root: string;
beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "moderno-gen-parity-matrix-"));
  mkdirSync(join(root, FRAGMENTS_DIR), { recursive: true });
  fragment("_intro.md", "# Parity Matrix\n");
  fragment(
    "_ssr.md",
    "## SSR\n\n| Guarantee | React | Vue | Svelte | Solid |\n| --- | :-: | :-: | :-: | :-: |\n| hydration | ✅ | ✅ | — | — |\n",
  );
  fragment("_ssr-footnotes.md", "¹ A footnote.\n");
  fragment("_notes.md", "## Notes\n");
});
afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

function fragment(file: string, markdown: string): void {
  writeFileSync(join(root, FRAGMENTS_DIR, file), markdown);
}

function component(slug: string, name: string, ssr: string): void {
  fragment(
    `${slug}.md`,
    `---\nssr: ${ssr}\n---\n\n### ${name}\n\n| State | React |\n| --- | :-: |\n| a | ✅ |\n`,
  );
}

describe("parity-matrix aggregator", () => {
  it("writes the parity matrix from the fragments folder", () => {
    expect(parityMatrix.output).toBe("docs/parity-matrix.md");
    expect(parityMatrix.source).toBe("docs/parity/*.md");
  });

  it("puts every section, sorted by slug, between the intro and the SSR table", async () => {
    component("toggle-group", "ToggleGroup", "ToggleGroup pressed");
    component("button", "Button", "Button scope");
    component("toggle", "Toggle", "Toggle pressed");

    const body = await parityMatrix.generate({ root, outputs: [] });
    const headings = body.split("\n").filter((line) => line.startsWith("#"));
    expect(headings).toEqual([
      "# Parity Matrix",
      "### Button",
      "### Toggle",
      "### ToggleGroup",
      "## SSR",
      "## Notes",
    ]);
  });

  it("adds one SSR row per component after the table's own rows, and aligns the table", async () => {
    component("button", "Button", "Button scope");
    component("toggle", "Toggle", "Toggle `aria-pressed`");

    const body = await parityMatrix.generate({ root, outputs: [] });
    const ssrTable = body.slice(body.indexOf("## SSR"), body.indexOf("¹"));
    expect(ssrTable.trim().split("\n").slice(2)).toEqual([
      "| Guarantee             | React | Vue | Svelte | Solid |",
      "| --------------------- | :---: | :-: | :----: | :---: |",
      "| hydration             |  ✅   | ✅  |   —    |   —   |",
      "| Button scope          |  ✅   | ✅  |   ✅   |  ✅   |",
      "| Toggle `aria-pressed` |  ✅   | ✅  |   ✅   |  ✅   |",
    ]);
  });

  it("leaves the front matter out of the sections and ends with the footnotes and notes", async () => {
    component("button", "Button", "Button scope");

    const body = await parityMatrix.generate({ root, outputs: [] });
    expect(body).not.toContain("ssr:");
    expect(body).not.toContain("---\n");
    expect(body.startsWith("\n# Parity Matrix\n")).toBe(true);
    expect(body.endsWith("¹ A footnote.\n\n## Notes\n")).toBe(true);
  });

  it("fails when a component fragment has no SSR row", async () => {
    fragment("button.md", "### Button\n");

    await expect(parityMatrix.generate({ root, outputs: [] })).rejects.toThrow(
      "docs/parity/button.md must open with front matter naming its SSR row",
    );
  });
});
