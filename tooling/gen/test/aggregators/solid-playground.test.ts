import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import solidPlayground from "../../src/aggregators/solid-playground.ts";

const SECTIONS_DIR = "packages/solid/playground/sections";

let root: string;
beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "moderno-gen-solid-playground-"));
  mkdirSync(join(root, SECTIONS_DIR), { recursive: true });
});
afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

function addSection(file: string): void {
  writeFileSync(join(root, SECTIONS_DIR, file), "export default () => null;\n");
}

describe("solid-playground aggregator", () => {
  it("writes Solid's playground entry from the sections folder", () => {
    expect(solidPlayground.output).toBe("packages/solid/playground/app.tsx");
    expect(solidPlayground.source).toBe("packages/solid/playground/sections/*.tsx");
  });

  it("statically imports every section, sorted by slug", () => {
    addSection("toggle-group.tsx");
    addSection("button.tsx");
    addSection("toggle.tsx");

    const body = solidPlayground.generate({ root, outputs: [] });
    const imports = body.split("\n").filter((line) => line.startsWith("import"));
    expect(imports).toEqual([
      'import ButtonSection from "./sections/button.jsx";',
      'import ToggleSection from "./sections/toggle.jsx";',
      'import ToggleGroupSection from "./sections/toggle-group.jsx";',
    ]);
  });

  it("mounts each section once, in the same order, handing it `open`", () => {
    addSection("radio-group.tsx");
    addSection("dialog.tsx");

    const body = solidPlayground.generate({ root, outputs: [] });
    const mounts = body
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.endsWith("Section open={props.open ?? false} />"));
    expect(mounts).toEqual([
      "<DialogSection open={props.open ?? false} />",
      "<RadioGroupSection open={props.open ?? false} />",
    ]);
  });

  it("ignores files that are not section modules", () => {
    addSection("button.tsx");
    writeFileSync(join(root, SECTIONS_DIR, "README.md"), "# notes\n");

    const body = solidPlayground.generate({ root, outputs: [] });
    expect(body).not.toContain("README");
  });
});
