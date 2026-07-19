import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { discoverManifests } from "@moderno/lint-core";
import { getContract } from "../src/tools/get-contract.ts";
import { ModernoMcpError } from "../src/tools/shared.ts";
import {
  createConsumerFixture,
  type ConsumerFixture,
} from "../../lint-core/test/helpers/consumer-fixture.ts";

let fixture: ConsumerFixture;

beforeAll(() => {
  fixture = createConsumerFixture();
});

afterAll(() => {
  fixture.cleanup();
});

describe("getContract", () => {
  it("returns the shared contract, identical regardless of which framework is being written", () => {
    const manifests = discoverManifests(fixture.dir);
    const contract = getContract(manifests);
    expect(contract.package).toBe("@moderno/tokens");
    expect(contract.slots.color).toContain("--primary");
    expect(contract.rules.length).toBeGreaterThan(0);
  });

  describe("when @moderno/tokens isn't installed", () => {
    let emptyDir: string;

    afterEach(() => {
      rmSync(emptyDir, { recursive: true, force: true });
    });

    it("throws a ModernoMcpError", () => {
      emptyDir = mkdtempSync(join(tmpdir(), "moderno-mcp-no-tokens-"));
      const manifests = discoverManifests(emptyDir);
      expect(() => getContract(manifests)).toThrow(ModernoMcpError);
    });
  });
});
