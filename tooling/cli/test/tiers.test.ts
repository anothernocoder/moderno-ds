import { describe, expect, it } from "vitest";
import { checkTiers } from "../src/tiers.ts";
import type { RegistryItem, RegistryItemType } from "../src/types.ts";

/** Minimal item: only the fields the tier rules read. */
function item(name: string, type: RegistryItemType, deps: string[] = []): RegistryItem {
  return { name, type, version: "1.0.0", registryDependencies: deps, files: [] };
}

const kinds = (items: RegistryItem[]): string[] => checkTiers(items).map((v) => v.kind);

describe("checkTiers — legal composition", () => {
  it("accepts the flow → screen → block → component ladder", () => {
    expect(
      checkTiers([
        item("button", "registry:component"),
        item("login-form", "registry:block", ["button"]),
        item("sign-in", "registry:screen", ["login-form"]),
        item("auth", "registry:flow", ["sign-in"]),
      ]),
    ).toEqual([]);
  });

  it("lets a screen reach past its blocks to an ejected component", () => {
    expect(
      checkTiers([
        item("button", "registry:component"),
        item("login-form", "registry:block", ["button"]),
        item("cart", "registry:screen", ["login-form", "button"]),
      ]),
    ).toEqual([]);
  });

  it("accepts a theme, which composes nothing", () => {
    expect(checkTiers([item("theme-moderno", "registry:theme")])).toEqual([]);
  });
});

describe("checkTiers — upward and skipping edges", () => {
  it("rejects a block that depends on a screen", () => {
    const violations = checkTiers([
      item("login-form", "registry:block", ["sign-in"]),
      item("sign-in", "registry:screen"),
    ]);
    expect(violations.map((v) => v.kind)).toEqual(["illegal-edge"]);
    expect(violations[0]!.message).toContain("login-form (registry:block)");
    expect(violations[0]!.message).toContain("sign-in (registry:screen)");
  });

  it("rejects a screen that depends on a flow", () => {
    expect(
      kinds([item("sign-in", "registry:screen", ["auth"]), item("auth", "registry:flow")]),
    ).toEqual(["illegal-edge"]);
  });

  it("rejects a flow that skips a tier and composes a block directly", () => {
    expect(
      kinds([item("auth", "registry:flow", ["login-form"]), item("login-form", "registry:block")]),
    ).toEqual(["illegal-edge"]);
  });

  it("rejects an item that depends on a theme", () => {
    expect(
      kinds([
        item("sign-in", "registry:screen", ["theme-moderno"]),
        item("theme-moderno", "registry:theme"),
      ]),
    ).toEqual(["illegal-edge"]);
  });

  it("reports every violation, not just the first", () => {
    expect(
      checkTiers([
        item("login-form", "registry:block", ["sign-in", "auth"]),
        item("sign-in", "registry:screen"),
        item("auth", "registry:flow", ["sign-in"]),
      ]),
    ).toHaveLength(2);
  });
});

describe("checkTiers — cycles and unknowns", () => {
  it("rejects a cycle between two items of the same tier", () => {
    const violations = checkTiers([
      item("a", "registry:component", ["b"]),
      item("b", "registry:component", ["a"]),
    ]);
    expect(violations.map((v) => v.kind)).toEqual(["cycle"]);
    expect(violations[0]!.message).toMatch(/a → b → a|b → a → b/);
  });

  it("reports a cycle once, however many entry points reach it", () => {
    const violations = checkTiers([
      item("hero", "registry:block", ["a", "b"]),
      item("a", "registry:component", ["b"]),
      item("b", "registry:component", ["a"]),
    ]);
    expect(violations.filter((v) => v.kind === "cycle")).toHaveLength(1);
  });

  it("rejects a dependency on an item the registry does not publish", () => {
    expect(kinds([item("sign-in", "registry:screen", ["nope"])])).toEqual(["unknown-dependency"]);
  });

  it("rejects an item whose type is not a published tier", () => {
    // exactly what a hand-edited registry.json yields once parsed
    const bogus = JSON.parse(
      '{"name":"x","type":"registry:page","version":"1.0.0","files":[]}',
    ) as RegistryItem;
    expect(kinds([bogus])).toEqual(["unknown-type"]);
  });
});
