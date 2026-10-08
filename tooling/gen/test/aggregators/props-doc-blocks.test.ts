import { readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import propsDocBlocks from "../../src/aggregators/props-doc-blocks.ts";

const root = fileURLToPath(new URL("../../../..", import.meta.url));

describe("props-doc-blocks aggregator", () => {
  it("writes the blocks' props hashes for props-doc", () => {
    expect(propsDocBlocks.output).toBe("tooling/props-doc/src/blocks.generated.ts");
  });

  it("records one hash per registry block folder, sorted by slug", async () => {
    const body = await propsDocBlocks.generate({ root, outputs: [] });
    const slugs = [...body.matchAll(/^ {2}"?([a-z0-9-]+)"?: "sha256:[0-9a-f]{64}",$/gm)].map(
      ([, slug]) => slug,
    );
    expect(slugs).toEqual(readdirSync(join(root, "registry/blocks")).sort());
  });
});
