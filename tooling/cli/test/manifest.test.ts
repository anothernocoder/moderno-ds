import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { hashContent } from "../src/hash.ts";
import { MANIFEST_PATH, readManifest, writeManifest } from "../src/manifest.ts";

let dir: string;
beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "moderno-cli-"));
});
afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("hashContent", () => {
  it("is stable for identical content and differs for changed content", () => {
    expect(hashContent("a")).toBe(hashContent("a"));
    expect(hashContent("a")).not.toBe(hashContent("a "));
  });
});

describe("manifest", () => {
  it("returns an empty manifest when none exists yet", async () => {
    const m = await readManifest(dir);
    expect(m.items).toEqual({});
  });

  it("round-trips through disk at .moderno/manifest.json", async () => {
    const m = await readManifest(dir);
    m.items["button"] = {
      version: "0.1.0",
      type: "registry:component",
      files: [{ target: "src/components/ui/button.tsx", hash: hashContent("x") }],
    };
    await writeManifest(dir, m);

    const onDisk = JSON.parse(await readFile(join(dir, MANIFEST_PATH), "utf8"));
    expect(onDisk.items.button.version).toBe("0.1.0");

    const reread = await readManifest(dir);
    expect(reread.items.button!.files[0]!.hash).toBe(hashContent("x"));
  });
});
