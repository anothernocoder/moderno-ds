import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { discoverManifests } from "../src/manifests.ts";
import { createConsumerFixture, type ConsumerFixture } from "./helpers/consumer-fixture.ts";

let fixture: ConsumerFixture;

beforeAll(() => {
  fixture = createConsumerFixture();
});

afterAll(() => {
  fixture.cleanup();
});

describe("discoverManifests", () => {
  it("finds node_modules/@moderno directly under cwd and aggregates every framework", () => {
    const result = discoverManifests(fixture.dir);
    expect(result.scopeDir).toBe(join(fixture.dir, "node_modules", "@moderno"));
    expect(result.components.map((m) => m.framework).sort()).toEqual(["react", "vue"]);
  });

  it("pins the manifest to the installed package's own version", () => {
    const result = discoverManifests(fixture.dir);
    const react = result.components.find((m) => m.framework === "react")!;
    expect(react.version).toBe("0.5.0");
    expect(react.package).toBe("@moderno/react");
  });

  it("walks up from a nested cwd to find node_modules/@moderno", () => {
    const nested = join(fixture.dir, "src", "app", "components");
    const result = discoverManifests(nested);
    expect(result.scopeDir).toBe(join(fixture.dir, "node_modules", "@moderno"));
  });

  it("splits the tokens package into the shared contract manifest", () => {
    const result = discoverManifests(fixture.dir);
    expect(result.contract?.package).toBe("@moderno/tokens");
    expect(result.contract?.kind).toBe("contract");
  });

  it("skips an installed @moderno package that has no built manifest yet", () => {
    const result = discoverManifests(fixture.dir);
    expect(result.components.some((m) => m.framework === "solid")).toBe(false);
  });

  describe("with no node_modules/@moderno anywhere up the tree", () => {
    let emptyDir: string;

    afterEach(() => {
      rmSync(emptyDir, { recursive: true, force: true });
    });

    it("returns an empty aggregation instead of throwing", () => {
      emptyDir = mkdtempSync(join(tmpdir(), "moderno-mcp-empty-"));
      const result = discoverManifests(emptyDir);
      expect(result).toEqual({ components: [], contract: null, scopeDir: null });
    });
  });
});
