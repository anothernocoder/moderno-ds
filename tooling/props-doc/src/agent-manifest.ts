/**
 * @moderno/props-doc — moderno.agent.json builder.
 *
 * Assembles the per-package agent manifest (schema:
 * `docs/prd/phase-7/moderno.agent.schema.json`) from generated facts only, so
 * the manifest can never drift from the code:
 *
 * - `props` — resolved by `extractProps` against the canonical `@moderno/react`
 *   source, the same "React is the single source of truth" rule `manifest.ts`
 *   already uses (props are identical across bindings by contract).
 * - `variants` — read straight off the shared `@moderno/core` recipe, when the
 *   component has one (Field/Dialog have none: their visual states are Ark's
 *   own data-attributes, not CVA variants).
 * - `guidance` — the curated `agent:` MDX front-matter block, parsed by
 *   `mdx-frontmatter.ts` and passed in by the caller.
 *
 * `parts` has no machine-readable source yet (Ark/Zag's own anatomy lists every
 * part the headless machine *could* render, not the subset `components.css`
 * actually styles), so `AGENT_COMPONENTS` hand-curates it — mirroring
 * `components.css`'s `[data-scope][data-part]` selectors is the contributor's
 * job when a part gains or loses styling.
 */
import { createHash } from "node:crypto";
import { buttonRecipe, selectRecipe } from "@moderno/core";
import { CONTRACT } from "@moderno/tokens/contract";
import { extractProps, type ComponentEntry, type PropDoc } from "./index.ts";
import { ENTRIES } from "./manifest.ts";

function findEntry(name: string): ComponentEntry {
  const entry = ENTRIES.find((e) => e.name === name);
  if (!entry) throw new Error(`props-doc manifest.ts has no ENTRIES row for "${name}"`);
  return entry;
}

export type Framework = "react" | "vue" | "svelte" | "solid" | "astro";

export interface AgentPart {
  name: string;
  description?: string;
}

export interface AgentGuidance {
  intent?: string;
  whenToUse?: string;
  whenNotToUse?: { case: string; use: string }[];
  gotchas?: string[];
  theming?: string[];
}

/** One curated component entry: everything that isn't generated per-framework. */
export interface AgentComponentSpec {
  /** Display/API name, matches the docs `component` front-matter field. */
  name: string;
  /** Docs MDX slug (`apps/docs/src/content/docs/en/<slug>.mdx`). */
  slug: string;
  /** `data-scope` value. */
  scope: string;
  /** Set when the component declares its own props; resolved via `extractProps`. */
  propsEntry?: ComponentEntry;
  /** `data-part` vocabulary this scope's `components.css` rules actually target. */
  parts: AgentPart[];
  /** The shared `@moderno/core` recipe's variant table, when one exists. */
  variants?: Record<string, readonly string[]>;
}

/**
 * The vertical slice (issue #41). Adding a primitive later means one entry
 * here plus a docs `agent:` block — the schema and build wiring don't change.
 */
export const AGENT_COMPONENTS: AgentComponentSpec[] = [
  {
    name: "Button",
    slug: "button",
    scope: "button",
    propsEntry: findEntry("Button"),
    parts: [{ name: "root" }],
    variants: buttonRecipe.variants,
  },
  {
    name: "Field",
    slug: "field",
    scope: "field",
    parts: [
      { name: "root" },
      { name: "label" },
      { name: "input" },
      { name: "textarea" },
      { name: "helper-text" },
      { name: "error-text" },
      { name: "required-indicator" },
    ],
  },
  {
    name: "Dialog",
    slug: "dialog",
    scope: "dialog",
    parts: [
      { name: "backdrop" },
      { name: "positioner" },
      { name: "content" },
      { name: "title" },
      { name: "description" },
    ],
  },
  {
    name: "Select",
    slug: "select",
    scope: "select",
    propsEntry: findEntry("Select"),
    parts: [
      { name: "root" },
      { name: "label" },
      { name: "trigger" },
      { name: "content" },
      { name: "item" },
    ],
    variants: selectRecipe.variants,
  },
];

export interface AgentProp {
  name: string;
  type: string;
  required: boolean;
  default?: string;
  description?: string;
}

export interface AgentComponent {
  name: string;
  scope: string;
  import: string;
  propsHash: string;
  props: AgentProp[];
  parts: AgentPart[];
  variants?: Record<string, readonly string[]>;
  guidance?: AgentGuidance;
}

export interface ComponentsManifest {
  package: string;
  version: string;
  kind: "components";
  framework: Framework;
  generatedFrom: { propsDoc: boolean; mdxAgentBlock: boolean };
  components: AgentComponent[];
}

/** sha256 of the generated props, so the CI drift gate (#45) can detect an unreviewed API change. */
function propsHash(props: PropDoc[]): string {
  return `sha256:${createHash("sha256").update(JSON.stringify(props)).digest("hex")}`;
}

export interface BuildComponentsManifestOptions {
  /** e.g. `@moderno/react`. */
  packageName: string;
  version: string;
  framework: Framework;
  /** Always `packages/react/tsconfig.json` — the canonical prop source for every binding. */
  reactTsConfigFilePath: string;
  components?: AgentComponentSpec[];
  /** Curated guidance per component name, from each component's docs `agent:` block. */
  guidance: Record<string, AgentGuidance | undefined>;
}

export function buildComponentsManifest(opts: BuildComponentsManifestOptions): ComponentsManifest {
  const components = opts.components ?? AGENT_COMPONENTS;
  const propsEntries = components.filter((c) => c.propsEntry).map((c) => c.propsEntry!);
  const extracted = extractProps({
    tsConfigFilePath: opts.reactTsConfigFilePath,
    entries: propsEntries,
  });
  const propsByName = new Map(extracted.map((d) => [d.name, d.props]));

  const built = components.map((c): AgentComponent => {
    const props = propsByName.get(c.name) ?? [];
    const guidance = opts.guidance[c.name];
    return {
      name: c.name,
      scope: c.scope,
      import: `import { ${c.name} } from "${opts.packageName}"`,
      propsHash: propsHash(props),
      props,
      parts: c.parts,
      ...(c.variants ? { variants: c.variants } : {}),
      ...(guidance ? { guidance } : {}),
    };
  });

  return {
    package: opts.packageName,
    version: opts.version,
    kind: "components",
    framework: opts.framework,
    generatedFrom: {
      propsDoc: true,
      mdxAgentBlock: built.every((c) => c.guidance !== undefined),
    },
    components: built,
  };
}

export interface ContractManifest {
  package: "@moderno/tokens";
  version: string;
  kind: "contract";
  goldenRule: string;
  slots: {
    color: string[];
    radius: string[];
    font: string[];
    spacing: string[];
    motion: string[];
  };
  theming: {
    darkMode: string;
    multiBrand: string;
    dataPartConvention: string;
  };
  rules: string[];
}

/** CONTRACT.md, as data — see that file for the prose this mirrors. */
export function buildContractManifest(version: string): ContractManifest {
  const slot = (name: string) => `--${name}`;
  return {
    package: "@moderno/tokens",
    version,
    kind: "contract",
    goldenRule: "Components are never edited. They are themed via variables and varied via props.",
    slots: {
      color: CONTRACT.filter((s) => s.type === "color").map((s) => slot(s.name)),
      radius: CONTRACT.filter((s) => s.name === "radius" || s.name === "radius-full").map((s) =>
        slot(s.name),
      ),
      font: CONTRACT.filter((s) => s.type === "fontFamily").map((s) => slot(s.name)),
      spacing: CONTRACT.filter((s) => s.name.startsWith("spacing-")).map((s) => slot(s.name)),
      motion: CONTRACT.filter((s) => s.name.startsWith("motion-")).map((s) => slot(s.name)),
    },
    theming: {
      darkMode:
        ":root is the light scope, .dark overrides it — shadcn-style, no third theming mechanism.",
      multiBrand:
        '[data-brand="…"] scopes overrides and composes with .dark; switching it re-maps variables without touching the base tokens.',
      dataPartConvention:
        'Component styles target [data-scope="x"][data-part="y"]; variants are data-variant/data-size on the root part, resolved from props by CVA in @moderno/core. Never target component-owned class names.',
    },
    rules: [
      "Reference contract slots; don't hardcode hex colors, px spacing, or ms durations.",
      "Put brand values in a theme; don't add brand identity to @moderno/tokens.",
      "Theme via variables and vary via props; don't fork component markup or write per-component CSS in a consumer project.",
      "Keep :root light / .dark dark; don't invent a third theming mechanism (data-theme, dark-first inversion).",
      "Keep @moderno/css the only public CSS specifier.",
    ],
  };
}
