import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { discoverAggregators } from "../src/gen.ts";
import { packageBarrel } from "../src/package-barrel.ts";

const aggregatorsDir = fileURLToPath(new URL("../src/aggregators", import.meta.url));

let root: string;
beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "moderno-barrel-"));
  mkdirSync(join(root, "packages/example/src/exports"), { recursive: true });
});
afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

function writeExportsFile(name: string, content: string): void {
  writeFileSync(join(root, "packages/example/src/exports", name), content);
}

describe("packageBarrel", () => {
  it("writes the header, then one export * per fragment, sorted by slug", async () => {
    writeExportsFile("_header.ts", "/** @moderno-ui/example */\n");
    writeExportsFile("toggle.ts", 'export { Toggle } from "../toggle.js";\n');
    writeExportsFile("button.ts", 'export { Button } from "../button.js";\n');
    writeExportsFile("toggle-group.ts", 'export { ToggleGroup } from "../toggle-group.js";\n');

    const barrel = packageBarrel("packages/example", "index.ts");
    expect(await barrel.generate({ root, outputs: [] })).toBe(
      "/** @moderno-ui/example */\n" +
        "\n" +
        'export * from "./exports/button.js";\n' +
        'export * from "./exports/toggle-group.js";\n' +
        'export * from "./exports/toggle.js";\n',
    );
  });

  it("reads only .ts fragments, never the _-prefixed header", async () => {
    writeExportsFile("_header.ts", "/** header */\n");
    writeExportsFile("README.md", "# not a fragment\n");
    writeExportsFile("button.ts", 'export { Button } from "../button.js";\n');

    const body = await packageBarrel("packages/example", "index.ts").generate({
      root,
      outputs: [],
    });
    expect(body).not.toContain("_header");
    expect(body).not.toContain("README");
  });

  it("declares the barrel it writes and the fragments it reads", () => {
    expect(packageBarrel("packages/solid", "index.tsx")).toMatchObject({
      output: "packages/solid/src/index.tsx",
      source: "packages/solid/src/exports/*.ts",
    });
  });

  it("is registered once per framework package", async () => {
    const outputs = (await discoverAggregators(aggregatorsDir)).map(
      ({ aggregator }) => aggregator.output,
    );
    expect(outputs).toEqual(
      expect.arrayContaining([
        "packages/react/src/index.ts",
        "packages/vue/src/index.ts",
        "packages/solid/src/index.tsx",
        "packages/svelte/src/index.ts",
      ]),
    );
  });
});
