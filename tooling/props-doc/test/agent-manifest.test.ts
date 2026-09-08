import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { AGENT_COMPONENTS, buildComponentsManifest } from "../src/agent-manifest.ts";
import { buildContractManifest } from "../src/contract-manifest.ts";

const reactTsConfig = fileURLToPath(
  new URL("../../../packages/react/tsconfig.json", import.meta.url),
);

describe("AGENT_COMPONENTS", () => {
  it("covers every shipped primitive once each", () => {
    const names = AGENT_COMPONENTS.map((c) => c.name);
    expect(names).toEqual([
      "Button",
      "Alert",
      "Card",
      "Divider",
      "Field",
      "Checkbox",
      "Dialog",
      "Select",
      "PinInput",
      "LineChart",
      "AreaChart",
      "BarChart",
      "ScatterChart",
    ]);
    expect(new Set(names).size).toBe(names.length);
  });

  it("gives every chart the shared chart scope and no CVA variants", () => {
    for (const name of ["LineChart", "AreaChart", "BarChart", "ScatterChart"]) {
      const spec = AGENT_COMPONENTS.find((c) => c.name === name)!;
      expect(spec.scope).toBe("chart");
      expect(spec.variants).toBeUndefined();
    }
  });
});

describe("buildComponentsManifest", () => {
  const manifest = buildComponentsManifest({
    packageName: "@moderno-ui/vue",
    version: "1.2.3",
    framework: "vue",
    reactTsConfigFilePath: reactTsConfig,
    guidance: { Button: { intent: "A single click action." } },
  });

  it("stamps the requested package/version/framework", () => {
    expect(manifest.package).toBe("@moderno-ui/vue");
    expect(manifest.version).toBe("1.2.3");
    expect(manifest.framework).toBe("vue");
    expect(manifest.kind).toBe("components");
  });

  it("builds the import string for the requested framework, not react", () => {
    const button = manifest.components.find((c) => c.name === "Button")!;
    expect(button.import).toBe('import { Button } from "@moderno-ui/vue"');
  });

  it("resolves Button/Select/Checkbox/Field/PinInput props from the canonical react source", () => {
    const button = manifest.components.find((c) => c.name === "Button")!;
    expect(button.props.map((p) => p.name).sort()).toEqual(["size", "variant"]);

    // Ark's own Root props (collection, count, mask, otp, …) are inherited from
    // node_modules and stay out of the manifest; only what Moderno declares.
    const field = manifest.components.find((c) => c.name === "Field")!;
    expect(field.props.map((p) => p.name)).toEqual(["size"]);

    const select = manifest.components.find((c) => c.name === "Select")!;
    expect(select.props.map((p) => p.name)).toEqual(["size"]);

    const checkbox = manifest.components.find((c) => c.name === "Checkbox")!;
    expect(checkbox.props.map((p) => p.name)).toEqual(["size"]);

    const pinInput = manifest.components.find((c) => c.name === "PinInput")!;
    expect(pinInput.props.map((p) => p.name)).toEqual(["size"]);
    expect(pinInput.variants).toEqual({ size: ["sm", "md", "lg"] });
  });

  it("gives Dialog empty props — it adds none of its own", () => {
    const doc = manifest.components.find((c) => c.name === "Dialog")!;
    expect(doc.props).toEqual([]);
    expect(doc.propsComplete).toBe(false);
    expect(doc.variants).toBeUndefined();
  });

  it("carries Alert's props, statuses and full anatomy — what validate_usage checks against", () => {
    const alert = manifest.components.find((c) => c.name === "Alert")!;
    expect(alert.scope).toBe("alert");
    expect(alert.props.map((p) => p.name).sort()).toEqual(["size", "variant"]);
    expect(alert.variants).toEqual({
      variant: ["info", "success", "warning", "error"],
      size: ["sm", "md"],
    });
    expect(alert.parts.map((p) => p.name)).toEqual([
      "root",
      "icon",
      "content",
      "title",
      "description",
      "action",
    ]);
  });

  it("marks the prop list complete only where the workspace declares every prop", () => {
    // The authored primitives own their whole API. The Ark-backed roots do
    // not: `Select.Root`'s `collection`, `Field.Root`'s `invalid` and
    // `Dialog.Root`'s `open` are declared under node_modules and dropped, so
    // `validate_usage` must not read their prop lists as exhaustive.
    const complete = manifest.components.filter((c) => c.propsComplete).map((c) => c.name);
    expect(complete).toEqual([
      "Button",
      "Alert",
      "Card",
      "Divider",
      "LineChart",
      "AreaChart",
      "BarChart",
      "ScatterChart",
    ]);
  });

  it("resolves Divider's recipe props, variants and styled parts", () => {
    const divider = manifest.components.find((c) => c.name === "Divider")!;
    expect(divider.props.map((p) => p.name)).toEqual(["align", "orientation"]);
    expect(divider.variants).toEqual({
      orientation: ["horizontal", "vertical"],
      align: ["start", "center", "end"],
    });
    expect(divider.parts.map((p) => p.name)).toEqual(["root", "label"]);
  });

  it("reads variants straight off the shared @moderno-ui/core recipes", () => {
    const button = manifest.components.find((c) => c.name === "Button")!;
    expect(button.variants).toEqual({
      variant: ["primary", "secondary", "outline", "ghost", "destructive"],
      size: ["sm", "md", "lg"],
    });

    const select = manifest.components.find((c) => c.name === "Select")!;
    expect(select.variants).toEqual({ size: ["sm", "md", "lg"] });

    const checkbox = manifest.components.find((c) => c.name === "Checkbox")!;
    expect(checkbox.variants).toEqual({ size: ["sm", "md", "lg"] });

    const field = manifest.components.find((c) => c.name === "Field")!;
    expect(field.variants).toEqual({ size: ["sm", "md", "lg"] });
  });

  it("attaches framework-specific examples, not the react snippet reused verbatim", () => {
    const button = manifest.components.find((c) => c.name === "Button")!;
    expect(button.examples).toBeDefined();
    expect(button.examples!.length).toBeGreaterThan(0);
    expect(button.examples![0]!.code).toContain('from "@moderno-ui/vue"');
    expect(button.examples![0]!.code).toContain("<script setup");

    const reactManifest = buildComponentsManifest({
      packageName: "@moderno-ui/react",
      version: "1.2.3",
      framework: "react",
      reactTsConfigFilePath: reactTsConfig,
      guidance: {},
    });
    const reactButton = reactManifest.components.find((c) => c.name === "Button")!;
    expect(reactButton.examples![0]!.code).toContain('from "@moderno-ui/react"');
    expect(reactButton.examples![0]!.code).not.toContain("<script setup");
  });

  it("covers every vertical-slice component with examples for every shipped framework", () => {
    for (const framework of ["react", "vue", "svelte", "solid"] as const) {
      const fwManifest = buildComponentsManifest({
        packageName: `@moderno-ui/${framework}`,
        version: "0.1.0",
        framework,
        reactTsConfigFilePath: reactTsConfig,
        guidance: {},
      });
      for (const component of fwManifest.components) {
        expect(component.examples, `${framework}/${component.name}`).toBeDefined();
        expect(component.examples!.length, `${framework}/${component.name}`).toBeGreaterThan(0);
      }
    }
    // Four ts-morph manifest builds in one test; exceeds the 5s default under
    // the full parallel run.
  }, 30_000);

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
      packageName: "@moderno-ui/vue",
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

  it("carries the @moderno-ui/tokens golden rule and version", () => {
    expect(manifest.package).toBe("@moderno-ui/tokens");
    expect(manifest.kind).toBe("contract");
    expect(manifest.version).toBe("0.1.0");
    expect(manifest.goldenRule).toMatch(/never edited/);
  });

  it("derives slot lists from the live CONTRACT — background/primary are color, radius is radius", () => {
    expect(manifest.slots.color).toContain("--background");
    expect(manifest.slots.color).toContain("--primary");
    expect(manifest.slots.radius).toEqual(["--radius", "--radius-full"]);
    expect(manifest.slots.font).toEqual(["--font-sans", "--font-mono", "--font-serif"]);
    expect(manifest.slots.spacing).toHaveLength(8);
    expect(manifest.slots.motion).toHaveLength(3);
  });

  it("carries the elevation and container families the extended contract added", () => {
    expect(manifest.slots.shadow).toEqual(["--shadow-sm", "--shadow-md", "--shadow-lg"]);
    expect(manifest.slots.container).toEqual([
      "--container-sm",
      "--container-md",
      "--container-lg",
    ]);
  });
});
