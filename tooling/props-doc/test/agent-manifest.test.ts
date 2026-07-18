import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { AGENT_COMPONENTS, buildComponentsManifest } from "../src/agent-manifest.ts";
import { buildContractManifest } from "../src/contract-manifest.ts";

const reactTsConfig = fileURLToPath(
  new URL("../../../packages/react/tsconfig.json", import.meta.url),
);

describe("AGENT_COMPONENTS", () => {
  it("covers the vertical slice once each", () => {
    const names = AGENT_COMPONENTS.map((c) => c.name);
    expect(names).toEqual(["Button", "Field", "Dialog", "Select"]);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe("buildComponentsManifest", () => {
  const manifest = buildComponentsManifest({
    packageName: "@moderno/vue",
    version: "1.2.3",
    framework: "vue",
    reactTsConfigFilePath: reactTsConfig,
    guidance: { Button: { intent: "A single click action." } },
  });

  it("stamps the requested package/version/framework", () => {
    expect(manifest.package).toBe("@moderno/vue");
    expect(manifest.version).toBe("1.2.3");
    expect(manifest.framework).toBe("vue");
    expect(manifest.kind).toBe("components");
  });

  it("builds the import string for the requested framework, not react", () => {
    const button = manifest.components.find((c) => c.name === "Button")!;
    expect(button.import).toBe('import { Button } from "@moderno/vue"');
  });

  it("resolves Button/Select props from the canonical react source", () => {
    const button = manifest.components.find((c) => c.name === "Button")!;
    expect(button.props.map((p) => p.name).sort()).toEqual(["size", "variant"]);

    const select = manifest.components.find((c) => c.name === "Select")!;
    expect(select.props.map((p) => p.name)).toEqual(["size"]);
  });

  it("gives Field and Dialog empty props — they add none of their own", () => {
    for (const name of ["Field", "Dialog"]) {
      const doc = manifest.components.find((c) => c.name === name)!;
      expect(doc.props).toEqual([]);
      expect(doc.variants).toBeUndefined();
    }
  });

  it("reads variants straight off the shared @moderno/core recipes", () => {
    const button = manifest.components.find((c) => c.name === "Button")!;
    expect(button.variants).toEqual({
      variant: ["primary", "secondary", "outline", "ghost", "destructive"],
      size: ["sm", "md", "lg"],
    });

    const select = manifest.components.find((c) => c.name === "Select")!;
    expect(select.variants).toEqual({ size: ["sm", "md", "lg"] });
  });

  it("attaches guidance only for components a caller supplied it for", () => {
    const button = manifest.components.find((c) => c.name === "Button")!;
    expect(button.guidance).toEqual({ intent: "A single click action." });

    const field = manifest.components.find((c) => c.name === "Field")!;
    expect(field.guidance).toBeUndefined();
  });

  it("flags generatedFrom.mdxAgentBlock false when any component lacks guidance", () => {
    expect(manifest.generatedFrom).toEqual({ propsDoc: true, mdxAgentBlock: false });
  });

  it("is deterministic: same props in, same propsHash out", () => {
    const again = buildComponentsManifest({
      packageName: "@moderno/vue",
      version: "1.2.3",
      framework: "vue",
      reactTsConfigFilePath: reactTsConfig,
      guidance: {},
    });
    const button = manifest.components.find((c) => c.name === "Button")!;
    const buttonAgain = again.components.find((c) => c.name === "Button")!;
    expect(buttonAgain.propsHash).toBe(button.propsHash);
  });
});

describe("buildContractManifest", () => {
  const manifest = buildContractManifest("0.1.0");

  it("carries the @moderno/tokens golden rule and version", () => {
    expect(manifest.package).toBe("@moderno/tokens");
    expect(manifest.kind).toBe("contract");
    expect(manifest.version).toBe("0.1.0");
    expect(manifest.goldenRule).toMatch(/never edited/);
  });

  it("derives slot lists from the live CONTRACT — background/primary are color, radius is radius", () => {
    expect(manifest.slots.color).toContain("--background");
    expect(manifest.slots.color).toContain("--primary");
    expect(manifest.slots.radius).toEqual(["--radius", "--radius-full"]);
    expect(manifest.slots.font).toEqual(["--font-sans", "--font-mono"]);
    expect(manifest.slots.spacing).toHaveLength(8);
    expect(manifest.slots.motion).toHaveLength(3);
  });
});
