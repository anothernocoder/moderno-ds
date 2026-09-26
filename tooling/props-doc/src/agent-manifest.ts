/**
 * @moderno-ui/props-doc — the `components` flavor of moderno.agent.json.
 *
 * (`@moderno-ui/css`'s `contract` flavor lives in `contract-manifest.ts`,
 * deliberately separate — see that file's header.)
 *
 * Assembles the per-package agent manifest (schema:
 * `docs/prd/phase-7/moderno.agent.schema.json`) from generated facts only, so
 * the manifest can never drift from the code:
 *
 * - `props` — resolved by `extractProps` against the canonical `@moderno-ui/react`
 *   source, the same "React is the single source of truth" rule `manifest.ts`
 *   already uses (props are identical across bindings by contract). `propsComplete`
 *   rides along from the same extraction: false for the roots that inherit their
 *   API from Ark/Zag, so `validate_usage` knows the list isn't exhaustive.
 * - `variants` — read straight off the shared `@moderno-ui/core` recipe, when the
 *   component has one (Dialog has none: its visual states are Ark's own
 *   data-attributes, not CVA variants).
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
import {
  alertRecipe,
  avatarRecipe,
  badgeRecipe,
  buttonRecipe,
  calloutRecipe,
  cardRecipe,
  checkboxRecipe,
  chipRecipe,
  dividerRecipe,
  fieldRecipe,
  indicatorRecipe,
  pinInputRecipe,
  selectRecipe,
  skeletonRecipe,
  spinnerRecipe,
  switchRecipe,
  radioGroupRecipe,
  toggleRecipe,
  toggleGroupRecipe,
} from "@moderno-ui/core";
import { extractProps, type ComponentDoc, type ComponentEntry, type PropDoc } from "./index.ts";
import { ENTRIES } from "./manifest.ts";
import { AGENT_EXAMPLES } from "./agent-examples.ts";

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
  /** The shared `@moderno-ui/core` recipe's variant table, when one exists. */
  variants?: Record<string, readonly string[]>;
}

/**
 * Every chart type shares this frame — `frameNodes`/`chartRoot`/`seriesGroup`
 * in `@moderno-ui/charts-core`'s `render.ts` — and adds only its own mark part
 * (`line`, `area`, `bar`, `point`) on top.
 */
const CHART_FRAME_PARTS: AgentPart[] = [
  { name: "root" },
  { name: "grid" },
  { name: "grid-line" },
  { name: "axis-line" },
  { name: "tick-label" },
  { name: "series" },
];

/**
 * Adding a primitive later means one entry here plus a docs `agent:` block —
 * the schema and build wiring don't change (issue #41 proved this on the
 * vertical slice; issue #46 fanned it out to the rest).
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
    name: "Alert",
    slug: "alert",
    scope: "alert",
    propsEntry: findEntry("Alert"),
    parts: [
      { name: "root" },
      { name: "icon" },
      { name: "content" },
      { name: "title" },
      { name: "description" },
      { name: "action" },
    ],
    variants: alertRecipe.variants,
  },
  {
    name: "Card",
    slug: "card",
    scope: "card",
    propsEntry: findEntry("Card"),
    parts: [
      { name: "root" },
      { name: "header" },
      { name: "title" },
      { name: "description" },
      { name: "content" },
      { name: "footer" },
    ],
    variants: cardRecipe.variants,
  },
  {
    name: "Divider",
    slug: "divider",
    scope: "divider",
    propsEntry: findEntry("Divider"),
    // The rule itself is drawn with the root's ::before/::after, so `label` is
    // the only part `components.css` targets besides the root.
    parts: [{ name: "root" }, { name: "label" }],
    variants: dividerRecipe.variants,
  },
  {
    name: "Badge",
    slug: "badge",
    scope: "badge",
    propsEntry: findEntry("Badge"),
    parts: [{ name: "root" }, { name: "dot", description: "Rendered only with `dot`." }],
    variants: badgeRecipe.variants,
  },
  {
    name: "Chip",
    slug: "chip",
    scope: "chip",
    propsEntry: findEntry("Chip"),
    parts: [
      { name: "root" },
      { name: "label" },
      { name: "remove-trigger", description: "Rendered only with `removable`." },
    ],
    variants: chipRecipe.variants,
  },
  {
    name: "Indicator",
    slug: "indicator",
    scope: "indicator",
    propsEntry: findEntry("Indicator"),
    // `pulse` is a boolean prop, not a recipe variant: it lands as a bare
    // `data-pulse` on the root, so it is absent from `variants`.
    parts: [{ name: "root" }, { name: "dot" }, { name: "label" }],
    variants: indicatorRecipe.variants,
  },
  {
    name: "Skeleton",
    slug: "skeleton",
    scope: "skeleton",
    propsEntry: findEntry("Skeleton"),
    parts: [{ name: "root" }],
    variants: skeletonRecipe.variants,
  },
  {
    name: "Spinner",
    slug: "spinner",
    scope: "spinner",
    propsEntry: findEntry("Spinner"),
    parts: [
      { name: "root" },
      { name: "circle", description: "The spinning ring; `aria-hidden`." },
      { name: "label", description: "Visually hidden text read by screen readers." },
    ],
    variants: spinnerRecipe.variants,
  },
  {
    name: "Callout",
    slug: "callout",
    scope: "callout",
    propsEntry: findEntry("Callout"),
    parts: [
      { name: "root", description: 'The note. `role="note"`; carries `data-variant`.' },
      { name: "icon", description: "Optional glyph slot; `aria-hidden`." },
      { name: "content" },
      { name: "title" },
      { name: "description" },
    ],
    variants: calloutRecipe.variants,
  },
  {
    name: "Field",
    slug: "field",
    scope: "field",
    propsEntry: findEntry("Field"),
    parts: [
      { name: "root" },
      { name: "label" },
      { name: "input" },
      { name: "textarea" },
      { name: "helper-text" },
      { name: "error-text" },
      { name: "required-indicator" },
    ],
    variants: fieldRecipe.variants,
  },
  {
    name: "Checkbox",
    slug: "checkbox",
    scope: "checkbox",
    propsEntry: findEntry("Checkbox"),
    parts: [{ name: "root" }, { name: "control" }, { name: "indicator" }, { name: "label" }],
    variants: checkboxRecipe.variants,
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
  {
    name: "PinInput",
    slug: "pin-input",
    scope: "pin-input",
    propsEntry: findEntry("PinInput"),
    parts: [{ name: "root" }, { name: "label" }, { name: "control" }, { name: "input" }],
    variants: pinInputRecipe.variants,
  },
  {
    name: "Avatar",
    slug: "avatar",
    scope: "avatar",
    propsEntry: findEntry("Avatar"),
    parts: [
      { name: "root" },
      { name: "image", description: "The picture; shown once it has loaded." },
      {
        name: "fallback",
        description: "The initials; shown while the image loads, when it fails, or with no image.",
      },
    ],
    variants: avatarRecipe.variants,
  },
  {
    name: "Switch",
    slug: "switch",
    scope: "switch",
    propsEntry: findEntry("Switch"),
    parts: [
      { name: "root" },
      { name: "control", description: "The track." },
      { name: "thumb", description: "The knob; slides to the far end when on." },
      { name: "label" },
    ],
    variants: switchRecipe.variants,
  },
  {
    name: "RadioGroup",
    slug: "radio-group",
    scope: "radio-group",
    propsEntry: findEntry("RadioGroup"),
    parts: [
      { name: "root" },
      { name: "label", description: "The group's label; it names the radiogroup." },
      { name: "item", description: "One option: a <label> around its radio." },
      { name: "item-control", description: "The radio circle." },
      { name: "item-text", description: "The option's label; names its radio." },
      {
        name: "item-description",
        description: "Moderno's hint under an option's label; goes inside item-text.",
      },
      { name: "indicator", description: "Ark's sliding highlight; unstyled by default." },
    ],
    variants: radioGroupRecipe.variants,
  },
  {
    name: "Toggle",
    slug: "toggle",
    scope: "toggle",
    propsEntry: findEntry("Toggle"),
    parts: [
      { name: "root", description: "A native <button> that stays pressed; aria-pressed." },
      {
        name: "indicator",
        description: "Optional; shows its children while on and its fallback while off.",
      },
    ],
    variants: toggleRecipe.variants,
  },
  {
    name: "ToggleGroup",
    slug: "toggle-group",
    scope: "toggle-group",
    propsEntry: findEntry("ToggleGroup"),
    parts: [
      { name: "root", description: "Carries variant and size for every item." },
      { name: "item", description: "One native <button>; on or off." },
    ],
    variants: toggleGroupRecipe.variants,
  },
  {
    name: "LineChart",
    slug: "line-chart",
    scope: "chart",
    propsEntry: findEntry("LineChart"),
    parts: CHART_FRAME_PARTS.concat({ name: "line" }),
  },
  {
    name: "AreaChart",
    slug: "area-chart",
    scope: "chart",
    propsEntry: findEntry("AreaChart"),
    parts: CHART_FRAME_PARTS.concat({ name: "area" }, { name: "line" }),
  },
  {
    name: "BarChart",
    slug: "bar-chart",
    scope: "chart",
    propsEntry: findEntry("BarChart"),
    parts: CHART_FRAME_PARTS.concat({ name: "bar" }),
  },
  {
    name: "ScatterChart",
    slug: "scatter-chart",
    scope: "chart",
    propsEntry: findEntry("ScatterChart"),
    parts: CHART_FRAME_PARTS.concat({ name: "point" }),
  },
];

export interface AgentProp {
  name: string;
  type: string;
  required: boolean;
  default?: string;
  description?: string;
}

export interface AgentExample {
  title: string;
  code: string;
}

export interface AgentComponent {
  name: string;
  scope: string;
  import: string;
  propsHash: string;
  props: AgentProp[];
  /**
   * True when `props` is the component's complete API and an attribute that
   * isn't in it (beyond the native attributes every binding forwards) is a
   * hallucination. False for a root wrapped around a headless machine, whose
   * Ark/Zag props `props-doc` cannot see: `validate_usage` must not call
   * `<Select.Root collection={…}>` an unknown prop.
   */
  propsComplete: boolean;
  parts: AgentPart[];
  variants?: Record<string, readonly string[]>;
  examples?: AgentExample[];
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

/**
 * sha256 of the generated props, so the CI drift gate (#45) can detect an
 * unreviewed API change. Exported so that gate can compute it for a component
 * without building the full manifest.
 */
export function computePropsHash(props: PropDoc[]): string {
  return `sha256:${createHash("sha256").update(JSON.stringify(props)).digest("hex")}`;
}

/**
 * Resolves each component's extracted docs against the canonical
 * `@moderno-ui/react` source, keyed by component name. Shared by
 * `buildComponentsManifest` and the CI drift gate (#45) so both compute the
 * same `propsHash` from the same source of truth.
 *
 * A component with no `propsEntry` (Field, Dialog — they add no props of their
 * own) is absent from the map; callers read that as no props, and as a prop
 * list that is *not* complete: what those roots accept is Ark's, invisible here.
 */
export function resolveComponentProps(
  components: AgentComponentSpec[],
  reactTsConfigFilePath: string,
): Map<string, ComponentDoc> {
  const propsEntries = components.filter((c) => c.propsEntry).map((c) => c.propsEntry!);
  const extracted = extractProps({
    tsConfigFilePath: reactTsConfigFilePath,
    entries: propsEntries,
  });
  return new Map(extracted.map((d) => [d.name, d]));
}

export interface BuildComponentsManifestOptions {
  /** e.g. `@moderno-ui/react`. */
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
  const docsByName = resolveComponentProps(components, opts.reactTsConfigFilePath);

  const built = components.map((c): AgentComponent => {
    const doc = docsByName.get(c.name);
    const props = doc?.props ?? [];
    const guidance = opts.guidance[c.name];
    const examples = AGENT_EXAMPLES[c.name]?.[opts.framework];
    return {
      name: c.name,
      scope: c.scope,
      import: `import { ${c.name} } from "${opts.packageName}"`,
      propsHash: computePropsHash(props),
      props,
      propsComplete: doc?.propsComplete ?? false,
      parts: c.parts,
      ...(c.variants ? { variants: c.variants } : {}),
      ...(examples ? { examples } : {}),
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
