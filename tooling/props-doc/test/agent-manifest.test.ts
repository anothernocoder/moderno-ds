import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { CONTRACT } from "@moderno-ui/css/contract";
import {
  AGENT_COMPONENTS,
  buildComponentsManifest,
  computePropsHash,
  resolveComponentProps,
  type AgentComponent,
  type ComponentsManifest,
  type Framework,
} from "../src/agent-manifest.ts";
import { buildContractManifest } from "../src/contract-manifest.ts";

const reactTsConfig = fileURLToPath(
  new URL("../../../packages/react/tsconfig.json", import.meta.url),
);

/**
 * The one ts-morph extraction this file runs (5–10 s): every manifest below
 * is built from it.
 */
const resolvedProps = resolveComponentProps(AGENT_COMPONENTS, reactTsConfig);

function buildManifest(
  framework: Framework,
  version: string,
  guidance: Parameters<typeof buildComponentsManifest>[0]["guidance"] = {},
): ComponentsManifest {
  return buildComponentsManifest({
    packageName: `@moderno-ui/${framework}`,
    version,
    framework,
    reactTsConfigFilePath: reactTsConfig,
    resolvedProps,
    guidance,
  });
}

/**
 * Each component's own assertions, one file per component in `components/`
 * (named by slug), run against its entry in the Vue manifest below. A new
 * component adds a file there instead of an `it` here.
 */
const expectations = Object.fromEntries(
  Object.entries(
    import.meta.glob<{ default: (component: AgentComponent) => void }>("./components/*.ts", {
      eager: true,
    }),
  ).map(([path, module]) => [path.replace(/^\.\/components\/(.*)\.ts$/, "$1"), module.default]),
);

describe("AGENT_COMPONENTS", () => {
  it("covers every shipped primitive once each, sorted by slug", () => {
    const names = AGENT_COMPONENTS.map((c) => c.name);
    expect(names).toEqual([
      "Accordion",
      "Alert",
      "AreaChart",
      "Avatar",
      "Badge",
      "BarChart",
      "Button",
      "Callout",
      "Card",
      "Checkbox",
      "Chip",
      "Dialog",
      "Divider",
      "Field",
      "Indicator",
      "LineChart",
      "NumberInput",
      "Pagination",
      "PinInput",
      "Progress",
      "RadioGroup",
      "ScatterChart",
      "Select",
      "Skeleton",
      "Slider",
      "Spinner",
      "Switch",
      "Tabs",
      "Toggle",
      "ToggleGroup",
    ]);
    expect(new Set(names).size).toBe(names.length);
    const slugs = AGENT_COMPONENTS.map((c) => c.slug);
    expect(slugs).toEqual([...slugs].sort());
  });

  it("has an expectation file for every component, and none for a component it lacks", () => {
    expect(Object.keys(expectations).sort()).toEqual(AGENT_COMPONENTS.map((c) => c.slug).sort());
  });
});

describe("buildComponentsManifest", () => {
  const manifest = buildManifest("vue", "1.2.3", { Button: { intent: "A single click action." } });

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

  describe("each component matches its expectation file", () => {
    for (const spec of AGENT_COMPONENTS) {
      it(spec.name, () => {
        const component = manifest.components.find((c) => c.name === spec.name)!;
        expectations[spec.slug]!(component);
      });
    }
  });

  it("marks the prop list complete only where the workspace declares every prop", () => {
    // The authored primitives own their whole API. The Ark-backed roots do
    // not: `Select.Root`'s `collection`, `Field.Root`'s `invalid` and
    // `Dialog.Root`'s `open` are declared under node_modules and dropped, so
    // `validate_usage` must not read their prop lists as exhaustive.
    const complete = manifest.components.filter((c) => c.propsComplete).map((c) => c.name);
    expect(complete).toEqual([
      "Alert",
      "AreaChart",
      "Badge",
      "BarChart",
      "Button",
      "Callout",
      "Card",
      "Chip",
      "Divider",
      "Indicator",
      "LineChart",
      "ScatterChart",
      "Skeleton",
      "Spinner",
    ]);
  });

  it("attaches framework-specific examples, not the react snippet reused verbatim", () => {
    const button = manifest.components.find((c) => c.name === "Button")!;
    expect(button.examples).toBeDefined();
    expect(button.examples!.length).toBeGreaterThan(0);
    expect(button.examples![0]!.code).toContain('from "@moderno-ui/vue"');
    expect(button.examples![0]!.code).toContain("<script setup");

    const reactManifest = buildManifest("react", "1.2.3");
    const reactButton = reactManifest.components.find((c) => c.name === "Button")!;
    expect(reactButton.examples![0]!.code).toContain('from "@moderno-ui/react"');
    expect(reactButton.examples![0]!.code).not.toContain("<script setup");
  });

  it("covers every component with examples for every shipped framework", () => {
    for (const framework of ["react", "vue", "svelte", "solid"] as const) {
      const fwManifest = buildManifest(framework, "0.1.0");
      for (const component of fwManifest.components) {
        expect(component.examples, `${framework}/${component.name}`).toBeDefined();
        expect(component.examples!.length, `${framework}/${component.name}`).toBeGreaterThan(0);
      }
    }
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
    const again = buildManifest("vue", "1.2.3");
    const button = manifest.components.find((c) => c.name === "Button")!;
    const buttonAgain = again.components.find((c) => c.name === "Button")!;
    expect(buttonAgain.propsHash).toBe(button.propsHash);
    expect(computePropsHash(structuredClone(button.props))).toBe(button.propsHash);
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
