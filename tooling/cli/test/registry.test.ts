import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { createRegistry } from "../src/registry.ts";

const registryDir = fileURLToPath(new URL("../../../registry", import.meta.url));

describe("createRegistry — resolves a local registry", () => {
  it("loads items and finds one by name with its version", async () => {
    const reg = await createRegistry(registryDir).load();
    expect(reg.getItem("button")?.version).toBe("0.1.0");
    expect(reg.getItem("theme-moderno")?.type).toBe("registry:theme");
    expect(reg.getItem("does-not-exist")).toBeUndefined();
  });

  it("reads a file's content relative to the registry root", async () => {
    const reg = await createRegistry(registryDir).load();
    const content = await reg.readFile("primitives/react/button.tsx");
    expect(content).toContain("export function Button");
  });
});
