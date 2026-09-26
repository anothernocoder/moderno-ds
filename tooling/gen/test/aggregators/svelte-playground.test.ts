import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import sveltePlayground from "../../src/aggregators/svelte-playground.ts";

const SECTIONS_DIR = "packages/svelte/playground/sections";

let root: string;
beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "moderno-gen-svelte-playground-"));
  mkdirSync(join(root, SECTIONS_DIR), { recursive: true });
});
afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

function addSection(file: string): void {
  writeFileSync(join(root, SECTIONS_DIR, file), "<section></section>\n");
}

describe("svelte-playground aggregator", () => {
  it("writes Svelte's playground entry from the sections folder", () => {
    expect(sveltePlayground.output).toBe("packages/svelte/playground/App.svelte");
    expect(sveltePlayground.source).toBe("packages/svelte/playground/sections/*.svelte");
  });

  it("imports every section, sorted by slug", () => {
    addSection("ToggleGroup.svelte");
    addSection("Button.svelte");
    addSection("Toggle.svelte");
    addSection("PinInput.svelte");
    addSection("Pagination.svelte");

    const body = sveltePlayground.generate({ root, outputs: [] });
    const imports = body
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("import"));
    expect(imports).toEqual([
      'import Button from "./sections/Button.svelte";',
      'import Pagination from "./sections/Pagination.svelte";',
      'import PinInput from "./sections/PinInput.svelte";',
      'import Toggle from "./sections/Toggle.svelte";',
      'import ToggleGroup from "./sections/ToggleGroup.svelte";',
    ]);
  });

  it("mounts each section once, in the same order, handing it `open`", () => {
    addSection("RadioGroup.svelte");
    addSection("Dialog.svelte");

    const body = sveltePlayground.generate({ root, outputs: [] });
    const mounts = body
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.endsWith("{open} />"));
    expect(mounts).toEqual(["<Dialog {open} />", "<RadioGroup {open} />"]);
  });

  it("ignores files that are not section components", () => {
    addSection("Button.svelte");
    writeFileSync(join(root, SECTIONS_DIR, "README.md"), "# notes\n");

    const body = sveltePlayground.generate({ root, outputs: [] });
    expect(body).not.toContain("README");
  });
});
