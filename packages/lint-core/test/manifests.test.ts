import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
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
  it("finds node_modules/@moderno-ui directly under cwd and aggregates every framework", () => {
    const result = discoverManifests(fixture.dir);
    expect(result.scopeDir).toBe(join(fixture.dir, "node_modules", "@moderno-ui"));
    expect(result.components.map((m) => m.framework).sort()).toEqual(["react", "vue"]);
  });

  it("pins the manifest to the installed package's own version", () => {
    const result = discoverManifests(fixture.dir);
    const react = result.components.find((m) => m.framework === "react")!;
    expect(react.version).toBe("0.5.0");
    expect(react.package).toBe("@moderno-ui/react");
  });

  it("reads the directory Node resolves a bare @moderno-ui/* import to", () => {
    const require = createRequire(join(fixture.dir, "package.json"));
    const reactPackageJson = require.resolve("@moderno-ui/react/package.json");
    const { scopeDir } = discoverManifests(fixture.dir);
    // Node resolves through symlinks (macOS's /var → /private/var), so compare real paths.
    expect(realpathSync(scopeDir!)).toBe(dirname(dirname(reactPackageJson)));
  });

  it("walks up from a nested cwd to find node_modules/@moderno-ui", () => {
    const nested = join(fixture.dir, "src", "app", "components");
    const result = discoverManifests(nested);
    expect(result.scopeDir).toBe(join(fixture.dir, "node_modules", "@moderno-ui"));
  });

  it("splits the css package into the shared contract manifest", () => {
    const result = discoverManifests(fixture.dir);
    expect(result.contract?.package).toBe("@moderno-ui/css");
    expect(result.contract?.kind).toBe("contract");
  });

  it("skips an installed @moderno-ui package that has no built manifest yet", () => {
    const result = discoverManifests(fixture.dir);
    expect(result.components.some((m) => m.framework === "solid")).toBe(false);
  });

  describe("with no node_modules/@moderno-ui anywhere up the tree", () => {
    let emptyDir: string;

    afterEach(() => {
      rmSync(emptyDir, { recursive: true, force: true });
    });

    it("returns an empty aggregation instead of throwing", () => {
      emptyDir = mkdtempSync(join(tmpdir(), "moderno-mcp-empty-"));
      const result = discoverManifests(emptyDir);
      expect(result).toEqual({ components: [], contract: null, scopeDir: null });
    });

    it("ignores a node_modules/@moderno directory from the pre-rename scope", () => {
      emptyDir = mkdtempSync(join(tmpdir(), "moderno-mcp-old-scope-"));
      const distDir = join(emptyDir, "node_modules", "@moderno", "react", "dist");
      mkdirSync(distDir, { recursive: true });
      writeFileSync(join(distDir, "moderno.agent.json"), JSON.stringify({ kind: "components" }));
      const result = discoverManifests(emptyDir);
      expect(result).toEqual({ components: [], contract: null, scopeDir: null });
    });
  });
});
