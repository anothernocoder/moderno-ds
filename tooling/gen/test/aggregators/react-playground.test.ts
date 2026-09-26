import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import reactPlayground from "../../src/aggregators/react-playground.ts";

const SECTIONS_DIR = "packages/react/playground/sections";

let root: string;
beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "moderno-gen-react-playground-"));
  mkdirSync(join(root, SECTIONS_DIR), { recursive: true });
});
afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

function addSection(file: string): void {
  writeFileSync(join(root, SECTIONS_DIR, file), "export default () => null;\n");
}

describe("react-playground aggregator", () => {
  it("writes React's playground entry from the sections folder", () => {
    expect(reactPlayground.output).toBe("packages/react/playground/app.tsx");
    expect(reactPlayground.source).toBe("packages/react/playground/sections/*.tsx");
  });

  it("statically imports every section, sorted by slug", () => {
    addSection("toggle-group.tsx");
    addSection("button.tsx");
    addSection("toggle.tsx");

    const body = reactPlayground.generate({ root, outputs: [] });
    const imports = body.split("\n").filter((line) => line.startsWith("import"));
    expect(imports).toEqual([
      'import ButtonSection from "./sections/button.js";',
      'import ToggleSection from "./sections/toggle.js";',
      'import ToggleGroupSection from "./sections/toggle-group.js";',
    ]);
  });

  it("mounts each section once, in the same order, handing it `open`", () => {
    addSection("radio-group.tsx");
    addSection("dialog.tsx");

    const body = reactPlayground.generate({ root, outputs: [] });
    const mounts = body
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.endsWith("Section open={open} />"));
    expect(mounts).toEqual(["<DialogSection open={open} />", "<RadioGroupSection open={open} />"]);
  });

  it("ignores files that are not section modules", () => {
    addSection("button.tsx");
    writeFileSync(join(root, SECTIONS_DIR, "README.md"), "# notes\n");

    const body = reactPlayground.generate({ root, outputs: [] });
    expect(body).not.toContain("README");
  });
});
