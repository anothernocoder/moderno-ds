import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import coreMachines from "../../src/aggregators/core-machines.ts";

const MACHINES_DIR = "packages/core/src/machines";

let root: string;
beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "moderno-gen-core-machines-"));
  mkdirSync(join(root, MACHINES_DIR), { recursive: true });
});
afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

function addMachine(slug: string): void {
  mkdirSync(join(root, MACHINES_DIR, slug));
  writeFileSync(join(root, MACHINES_DIR, slug, "index.ts"), "export {};\n");
}

function exportLines(body: string): string[] {
  return body.split("\n").filter((line) => line.startsWith("export"));
}

describe("core-machines aggregator", () => {
  it("writes core's machine barrel from the machine folders", () => {
    expect(coreMachines.output).toBe("packages/core/src/machines.ts");
    expect(coreMachines.source).toBe("packages/core/src/machines/*/index.ts");
  });

  it("exports every machine as a camel-cased namespace, sorted by slug", () => {
    addMachine("toolbar");
    addMachine("sortable-list");
    addMachine("vector-pad");

    expect(exportLines(coreMachines.generate({ root, outputs: [] }))).toEqual([
      'export * as sortableList from "./machines/sortable-list/index.js";',
      'export * as toolbar from "./machines/toolbar/index.js";',
      'export * as vectorPad from "./machines/vector-pad/index.js";',
    ]);
  });

  it("is an empty module while there is no machine", () => {
    writeFileSync(join(root, MACHINES_DIR, "README.md"), "# notes\n");

    expect(exportLines(coreMachines.generate({ root, outputs: [] }))).toEqual(["export {};"]);
  });

  it("skips a folder without an index.ts", () => {
    addMachine("toolbar");
    mkdirSync(join(root, MACHINES_DIR, "draft"));

    expect(exportLines(coreMachines.generate({ root, outputs: [] }))).toEqual([
      'export * as toolbar from "./machines/toolbar/index.js";',
    ]);
  });
});
