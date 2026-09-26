import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { CONTRACT } from "@moderno-ui/css/contract";
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
      "Badge",
      "Chip",
      "Indicator",
      "Skeleton",
      "Spinner",
      "Callout",
      "Field",
      "Checkbox",
      "Dialog",
      "Select",
      "PinInput",
      "Avatar",
      "Switch",
      "RadioGroup",
      "Toggle",
      "ToggleGroup",
      "Tabs",
      "Accordion",
      "Progress",
      "Slider",
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

    const field = manifest.components.find((c) => c.name === "Field")!;
    expect(field.props.map((p) => p.name)).toEqual(["size"]);

    const select = manifest.components.find((c) => c.name === "Select")!;
    expect(select.props.map((p) => p.name)).toEqual(["size"]);

    const checkbox = manifest.components.find((c) => c.name === "Checkbox")!;
    expect(checkbox.props.map((p) => p.name)).toEqual(["size"]);

    // Ark's own Root props (count, mask, otp, …) are inherited from
    // node_modules and stay out of the table; only what Moderno declares.
    const pinInput = manifest.components.find((c) => c.name === "PinInput")!;
    expect(pinInput.props.map((p) => p.name)).toEqual(["size"]);
    expect(pinInput.variants).toEqual({ size: ["sm", "md", "lg"] });
  });

  it("gives Dialog empty props — it adds none of its own", () => {
    const doc = manifest.components.find((c) => c.name === "Dialog")!;
    expect(doc.props).toEqual([]);
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
      "Badge",
      "Chip",
      "Indicator",
      "Skeleton",
      "Spinner",
      "Callout",
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

  it("gives Dialog empty props — it adds none of its own", () => {
    const doc = manifest.components.find((c) => c.name === "Dialog")!;
    expect(doc.props).toEqual([]);
    expect(doc.variants).toBeUndefined();
  });

  it("carries Badge, Chip and Indicator props — what validate_usage checks against", () => {
    const badge = manifest.components.find((c) => c.name === "Badge")!;
    expect(badge.scope).toBe("badge");
    expect(badge.props.map((p) => p.name).sort()).toEqual(["dot", "size", "variant"]);
    expect(badge.variants?.variant).toContain("warning");
    expect(badge.parts.map((p) => p.name)).toEqual(["root", "dot"]);

    const chip = manifest.components.find((c) => c.name === "Chip")!;
    expect(chip.scope).toBe("chip");
    expect(chip.props.map((p) => p.name).sort()).toEqual([
      "onRemove",
      "removable",
      "removeLabel",
      "size",
      "variant",
    ]);
    expect(chip.parts.map((p) => p.name)).toEqual(["root", "label", "remove-trigger"]);

    // `pulse` is a real prop but not a recipe variant, so it is in `props` and
    // absent from `variants`: the enum check has nothing to gate it against.
    const indicator = manifest.components.find((c) => c.name === "Indicator")!;
    expect(indicator.scope).toBe("indicator");
    expect(indicator.props.map((p) => p.name).sort()).toEqual(["pulse", "size", "variant"]);
    expect(indicator.variants).toEqual({
      variant: ["neutral", "info", "success", "warning", "error"],
      size: ["sm", "md"],
    });
    expect(indicator.parts.map((p) => p.name)).toEqual(["root", "dot", "label"]);
  });

  it("carries Skeleton and Spinner props — what validate_usage checks against", () => {
    const skeleton = manifest.components.find((c) => c.name === "Skeleton")!;
    expect(skeleton.scope).toBe("skeleton");
    expect(skeleton.props.map((p) => p.name)).toEqual(["shape"]);
    expect(skeleton.variants).toEqual({ shape: ["text", "rect", "circle"] });
    expect(skeleton.parts.map((p) => p.name)).toEqual(["root"]);

    const spinner = manifest.components.find((c) => c.name === "Spinner")!;
    expect(spinner.scope).toBe("spinner");
    expect(spinner.props.map((p) => p.name).sort()).toEqual(["label", "size"]);
    expect(spinner.variants).toEqual({ size: ["sm", "md", "lg"] });
    expect(spinner.parts.map((p) => p.name)).toEqual(["root", "circle", "label"]);
  });

  it("carries Callout's variant and anatomy — what validate_usage checks against", () => {
    const callout = manifest.components.find((c) => c.name === "Callout")!;
    expect(callout.scope).toBe("callout");
    expect(callout.props.map((p) => p.name)).toEqual(["variant"]);
    expect(callout.variants).toEqual({ variant: ["info", "success", "warning", "error"] });
    expect(callout.parts.map((p) => p.name)).toEqual([
      "root",
      "icon",
      "content",
      "title",
      "description",
    ]);
    expect(callout.propsComplete).toBe(true);
  });

  it("carries Avatar's recipe props, variants and Ark parts — what validate_usage checks against", () => {
    const avatar = manifest.components.find((c) => c.name === "Avatar")!;
    expect(avatar.scope).toBe("avatar");
    expect(avatar.props.map((p) => p.name).sort()).toEqual(["shape", "size"]);
    expect(avatar.variants).toEqual({ size: ["sm", "md", "lg"], shape: ["circle", "square"] });
    expect(avatar.parts.map((p) => p.name)).toEqual(["root", "image", "fallback"]);
    // Ark's own Root props (onStatusChange, ids) live under node_modules.
    expect(avatar.propsComplete).toBe(false);
  });

  it("carries Switch's recipe prop, variants and Ark parts — what validate_usage checks against", () => {
    const sw = manifest.components.find((c) => c.name === "Switch")!;
    expect(sw.scope).toBe("switch");
    expect(sw.props.map((p) => p.name)).toEqual(["size"]);
    expect(sw.variants).toEqual({ size: ["sm", "md", "lg"] });
    expect(sw.parts.map((p) => p.name)).toEqual(["root", "control", "thumb", "label"]);
    // Ark's own Root props (checked, onCheckedChange, …) live under node_modules.
    expect(sw.propsComplete).toBe(false);
  });

  it("carries RadioGroup's recipe prop, variants and parts — what validate_usage checks against", () => {
    const rg = manifest.components.find((c) => c.name === "RadioGroup")!;
    expect(rg.scope).toBe("radio-group");
    expect(rg.props.map((p) => p.name)).toEqual(["size"]);
    expect(rg.variants).toEqual({ size: ["sm", "md", "lg"] });
    expect(rg.parts.map((p) => p.name)).toEqual([
      "root",
      "label",
      "item",
      "item-control",
      "item-text",
      "item-description",
      "indicator",
    ]);
    // Ark's own Root props (value, orientation, onValueChange, …) live under node_modules.
    expect(rg.propsComplete).toBe(false);
  });

  it("carries Toggle's and ToggleGroup's recipe props, variants and Ark parts", () => {
    const toggle = manifest.components.find((c) => c.name === "Toggle")!;
    expect(toggle.scope).toBe("toggle");
    expect(toggle.props.map((p) => p.name)).toEqual(["size", "variant"]);
    expect(toggle.variants).toEqual({ variant: ["ghost", "outline"], size: ["sm", "md", "lg"] });
    expect(toggle.parts.map((p) => p.name)).toEqual(["root", "indicator"]);

    const group = manifest.components.find((c) => c.name === "ToggleGroup")!;
    expect(group.scope).toBe("toggle-group");
    expect(group.props.map((p) => p.name)).toEqual(["size", "variant"]);
    expect(group.variants).toEqual({ variant: ["ghost", "outline"], size: ["sm", "md", "lg"] });
    expect(group.parts.map((p) => p.name)).toEqual(["root", "item"]);
    // Ark's own Root props (pressed, value, multiple, …) live under node_modules.
    expect(toggle.propsComplete).toBe(false);
    expect(group.propsComplete).toBe(false);
  });

  it("carries Tabs' recipe props, variants and Ark parts", () => {
    const tabs = manifest.components.find((c) => c.name === "Tabs")!;
    expect(tabs.scope).toBe("tabs");
    expect(tabs.props.map((p) => p.name)).toEqual(["size", "variant"]);
    expect(tabs.variants).toEqual({ variant: ["line", "enclosed"], size: ["sm", "md", "lg"] });
    expect(tabs.parts.map((p) => p.name)).toEqual([
      "root",
      "list",
      "trigger",
      "indicator",
      "content",
    ]);
    // Ark's own Root props (value, orientation, activationMode, …) live under node_modules.
    expect(tabs.propsComplete).toBe(false);
  });

  it("carries Accordion's recipe props, variants and Ark parts", () => {
    const accordion = manifest.components.find((c) => c.name === "Accordion")!;
    expect(accordion.scope).toBe("accordion");
    expect(accordion.props.map((p) => p.name)).toEqual(["size", "variant"]);
    expect(accordion.variants).toEqual({
      variant: ["line", "enclosed"],
      size: ["sm", "md", "lg"],
    });
    expect(accordion.parts.map((p) => p.name)).toEqual([
      "root",
      "item",
      "item-trigger",
      "item-indicator",
      "item-content",
    ]);
    // Ark's own Root props (value, multiple, collapsible, …) live under node_modules.
    expect(accordion.propsComplete).toBe(false);
  });

  it("carries Progress's recipe prop, size and Ark parts", () => {
    const progress = manifest.components.find((c) => c.name === "Progress")!;
    expect(progress.scope).toBe("progress");
    expect(progress.props.map((p) => p.name)).toEqual(["size"]);
    expect(progress.variants).toEqual({ size: ["sm", "md", "lg"] });
    expect(progress.parts.map((p) => p.name)).toEqual([
      "root",
      "label",
      "value-text",
      "track",
      "range",
      "circle",
      "circle-track",
      "circle-range",
      "view",
    ]);
    // Ark's own Root props (value, min, max, …) live under node_modules.
    expect(progress.propsComplete).toBe(false);
  });

  it("carries Slider's recipe prop, size and Ark parts", () => {
    const slider = manifest.components.find((c) => c.name === "Slider")!;
    expect(slider.scope).toBe("slider");
    expect(slider.props.map((p) => p.name)).toEqual(["size"]);
    expect(slider.variants).toEqual({ size: ["sm", "md", "lg"] });
    expect(slider.parts.map((p) => p.name)).toEqual([
      "root",
      "label",
      "value-text",
      "control",
      "track",
      "range",
      "thumb",
      "dragging-indicator",
      "marker-group",
      "marker",
    ]);
    // Ark's own Root props (value, min, max, step, …) live under node_modules.
    expect(slider.propsComplete).toBe(false);
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

  it("carries the @moderno-ui/css golden rule and version", () => {
    expect(manifest.package).toBe("@moderno-ui/css");
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

  it("carries the type scale (a size and a line height per step) and the weights", () => {
    expect(manifest.slots.type).toContain("--text-ui-md");
    expect(manifest.slots.type).toContain("--leading-ui-md");
    expect(manifest.slots.type.filter((s) => s.startsWith("--font-weight-"))).toEqual([
      "--font-weight-normal",
      "--font-weight-medium",
      "--font-weight-semibold",
      "--font-weight-bold",
    ]);
    expect(manifest.slots.type).toHaveLength(22);
  });

  it("carries each slot's role from the contract", () => {
    expect(Object.keys(manifest.roles)).toEqual(CONTRACT.map((s) => `--${s.name}`));
    for (const s of CONTRACT) expect(manifest.roles[`--${s.name}`]).toBe(s.role);
  });

  it("lists the extended modal scrim among the colour slots an agent may reference", () => {
    expect(manifest.slots.color).toContain("--overlay");
  });
});
