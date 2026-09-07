import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { checkTiers } from "../src/tiers.ts";
import { isRegistryItemType, REGISTRY_ITEM_TYPES, type Registry } from "../src/types.ts";

const registryDir = fileURLToPath(new URL("../../../registry", import.meta.url));
const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));
const registry = JSON.parse(readFileSync(join(registryDir, "registry.json"), "utf8")) as Registry;

const SEMVER = /^\d+\.\d+\.\d+$/;

describe("registry.json integrity", () => {
  it("has unique item names", () => {
    const names = registry.items.map((i) => i.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("gives every item a semver version", () => {
    for (const item of registry.items) {
      expect(item.version, item.name).toMatch(SEMVER);
    }
  });

  it("points every file at content that exists under the registry root", () => {
    for (const item of registry.items) {
      for (const file of item.files) {
        expect(existsSync(join(registryDir, file.path)), `${item.name} → ${file.path}`).toBe(true);
      }
    }
  });

  it("resolves every registryDependency to a known item", () => {
    const names = new Set(registry.items.map((i) => i.name));
    for (const item of registry.items) {
      for (const dep of item.registryDependencies ?? []) {
        expect(names.has(dep), `${item.name} depends on unknown ${dep}`).toBe(true);
      }
    }
  });

  it("gives every item one of the published types", () => {
    for (const item of registry.items) {
      expect(isRegistryItemType(item.type), `${item.name} → ${item.type}`).toBe(true);
    }
    // the two composition tiers above blocks are part of that set
    expect(REGISTRY_ITEM_TYPES).toContain("registry:screen");
    expect(REGISTRY_ITEM_TYPES).toContain("registry:flow");
  });

  it("obeys the tier rules — no upward or cyclic composition", () => {
    expect(checkTiers(registry.items).map((v) => v.message)).toEqual([]);
  });

  it("keeps the ejected button in sync with the @moderno-ui/react source", () => {
    const ejected = readFileSync(join(registryDir, "primitives/react/button.tsx"), "utf8");
    const source = readFileSync(join(repoRoot, "packages/react/src/button.tsx"), "utf8");
    // identical logic — only the doc comment differs, so compare the code body
    const body = (s: string) => s.replace(/\/\*\*[\s\S]*?\*\//, "").trim();
    expect(body(ejected)).toBe(body(source));
  });
});
