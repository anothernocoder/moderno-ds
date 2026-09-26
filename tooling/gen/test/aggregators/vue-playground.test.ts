import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import vuePlayground from "../../src/aggregators/vue-playground.ts";

const SECTIONS_DIR = "packages/vue/playground/sections";

let root: string;
beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "moderno-gen-vue-playground-"));
  mkdirSync(join(root, SECTIONS_DIR), { recursive: true });
});
afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

function addSection(file: string): void {
  writeFileSync(join(root, SECTIONS_DIR, file), "export default () => null;\n");
}

describe("vue-playground aggregator", () => {
  it("writes Vue's playground entry from the sections folder", () => {
    expect(vuePlayground.output).toBe("packages/vue/playground/app.ts");
    expect(vuePlayground.source).toBe("packages/vue/playground/sections/*.ts");
  });

  it("statically imports every section, sorted by slug", () => {
    addSection("toggle-group.ts");
    addSection("button.ts");
    addSection("toggle.ts");

    const body = vuePlayground.generate({ root, outputs: [] });
    const imports = body.split("\n").filter((line) => line.startsWith("import"));
    expect(imports).toEqual([
      'import { defineComponent, h } from "vue";',
      'import ButtonSection from "./sections/button.js";',
      'import ToggleSection from "./sections/toggle.js";',
      'import ToggleGroupSection from "./sections/toggle-group.js";',
    ]);
  });

  it("mounts each section once, in the same order, handing it `open`", () => {
    addSection("radio-group.ts");
    addSection("dialog.ts");

    const body = vuePlayground.generate({ root, outputs: [] });
    const mounts = body
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.endsWith("{ open: props.open }),"));
    expect(mounts).toEqual([
      "h(DialogSection, { open: props.open }),",
      "h(RadioGroupSection, { open: props.open }),",
    ]);
  });

  it("ignores files that are not section modules", () => {
    addSection("button.ts");
    writeFileSync(join(root, SECTIONS_DIR, "README.md"), "# notes\n");

    const body = vuePlayground.generate({ root, outputs: [] });
    expect(body).not.toContain("README");
  });
});
