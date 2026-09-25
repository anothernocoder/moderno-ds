/**
 * A theme's DESIGN.md (google-labs format), rendered from its DTCG file.
 *
 * Every registry theme ships a DESIGN.md beside its theme.css, in three parts:
 *
 * 1. **Front matter**: the theme's values, from its tokens.dtcg.json plus the
 *    neutral defaults it inherits. The format has no dark mode, so the light
 *    scope uses the contract names and the dark scope follows as `dark-*`.
 * 2. **System rules**: how any Moderno theme is applied. They come from the
 *    token contract (@moderno-ui/tokens/contract), are identical for every
 *    theme, and name slots without restating values, so they cannot drift.
 * 3. **Brand notes**: the one hand-written part, between the brand-notes
 *    markers. A rebuild keeps them verbatim; a theme without notes gets a
 *    draft derived from its values, for a person to review and rewrite.
 *
 * Browser-safe on purpose (no node: imports): the docs Theme Builder renders
 * the same file for a theme it exports.
 */
import {
  CONTRACT,
  CONTRAST_PAIRS,
  FONT_WEIGHTS,
  TYPE_STEPS,
  type ContractGroup,
} from "@moderno-ui/tokens/contract";
import { contrastRatio, parseOklch } from "./color.ts";

type Token = { $value: string };
type ThemeDoc = {
  $description?: string;
  $extensions?: { "style.moderno.theme"?: { name?: string; brand?: string | null } };
  light: Record<string, Token>;
  dark: Record<string, Token>;
};

/** The neutral values a theme inherits for every slot it leaves out, per scope. */
export type Defaults = { light: Map<string, string>; dark: Map<string, string> };

export const BRAND_NOTES_START = "<!-- brand-notes:start -->";
export const BRAND_NOTES_END = "<!-- brand-notes:end -->";

/** Custom properties declared directly in `selector { … }` of a stylesheet. */
export function declsFor(css: string, selector: string): Map<string, string> {
  const out = new Map<string, string>();
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const blocks = withoutComments.matchAll(/([^{}]+)\{([^{}]*)\}/g);
  for (const [, sel, body] of blocks) {
    if (sel!.trim() !== selector) continue;
    for (const [, name, value] of body!.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
      out.set(name!, value!.trim());
    }
  }
  return out;
}

/** The neutral defaults a theme inherits, read from @moderno-ui/tokens' tokens.css. */
export function defaultsFrom(tokensCss: string): Defaults {
  return { light: declsFor(tokensCss, ":root"), dark: declsFor(tokensCss, ".dark") };
}

function asThemeDoc(doc: unknown): ThemeDoc {
  const d = doc as Partial<ThemeDoc> | null;
  if (typeof d !== "object" || d === null) throw new Error("DESIGN.md: theme must be an object");
  if (typeof d.light !== "object" || d.light === null) {
    throw new Error('DESIGN.md: no "light" scope');
  }
  return { ...d, light: d.light, dark: d.dark ?? {} } as ThemeDoc;
}

/**
 * The value a slot resolves to in each scope. In the dark scope a theme's own
 * `:root` loads after tokens.css and beats its `.dark` (same specificity, later
 * source), so the chain is theme dark → theme light → default dark → default light.
 */
function resolver(doc: ThemeDoc, defaults: Defaults) {
  const light = (slot: string) => doc.light[slot]?.$value ?? defaults.light.get(slot);
  const dark = (slot: string) =>
    doc.dark[slot]?.$value ??
    doc.light[slot]?.$value ??
    defaults.dark.get(slot) ??
    defaults.light.get(slot);
  return { light, dark };
}

function required(slot: string, value: string | undefined): string {
  if (value === undefined) throw new Error(`DESIGN.md: no value for --${slot}`);
  return value;
}

/** The first family of a font stack, unquoted: what DESIGN.md calls `fontFamily`. */
function primaryFamily(stack: string): string {
  return stack
    .split(",")[0]!
    .trim()
    .replace(/^["']|["']$/g, "");
}

function themeName(doc: ThemeDoc): string {
  return doc.$extensions?.["style.moderno.theme"]?.name ?? "theme";
}

function brandOf(doc: ThemeDoc): string | null {
  return doc.$extensions?.["style.moderno.theme"]?.brand ?? null;
}

/** `theme-ocean-breeze` → `Ocean Breeze`. */
function titleFor(name: string): string {
  return name
    .replace(/^theme-/, "")
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// — Front matter —

const COLOR_NAMES = CONTRACT.filter((s) => s.type === "color").map((s) => s.name);

/**
 * A quoted YAML scalar, quoted the way Prettier would: double quotes (a JSON
 * string is a valid YAML scalar) unless the value holds more double quotes
 * than single ones, which reads better single-quoted.
 */
function yaml(value: string): string {
  const count = (q: string) => value.split(q).length - 1;
  if (count('"') > count("'") && !/[\n\\]/.test(value)) {
    return `'${value.replaceAll("'", "''")}'`;
  }
  return JSON.stringify(value);
}

function renderFrontMatter(doc: ThemeDoc, defaults: Defaults): string {
  const { light, dark } = resolver(doc, defaults);
  const name = themeName(doc);
  const description =
    doc.$description ?? `The ${titleFor(name)} theme for the Moderno design system.`;
  const lines = [
    "---",
    `# Generated by \`pnpm theme:build\` from registry/themes/${name}/tokens.dtcg.json. Edit that file, not this block.`,
    "version: alpha",
    `name: ${yaml(titleFor(name))}`,
    `description: ${yaml(description)}`,
    "colors:",
    ...COLOR_NAMES.map((slot) => `  ${slot}: ${yaml(required(slot, light(slot)))}`),
    ...COLOR_NAMES.map((slot) => `  dark-${slot}: ${yaml(required(slot, dark(slot)))}`),
    "typography:",
  ];
  // Font weight is left out: the contract's weights are not tied to a type
  // step, so pairing one with each style here would be invented.
  const family = primaryFamily(required("font-sans", light("font-sans")));
  for (const step of TYPE_STEPS) {
    lines.push(
      `  ${step}:`,
      `    fontFamily: ${yaml(family)}`,
      `    fontSize: ${required(`text-${step}`, light(`text-${step}`))}`,
      `    lineHeight: ${required(`leading-${step}`, light(`leading-${step}`))}`,
    );
  }
  lines.push(
    "rounded:",
    `  base: ${required("radius", light("radius"))}`,
    `  full: ${required("radius-full", light("radius-full"))}`,
    "spacing:",
  );
  for (const slot of CONTRACT.filter((s) => s.name.startsWith("spacing-"))) {
    lines.push(
      `  "${slot.name.slice("spacing-".length)}": ${required(slot.name, light(slot.name))}`,
    );
  }
  lines.push("---");
  return lines.join("\n");
}

// — System rules —

const SLOT_NAMES = new Set(CONTRACT.map((s) => s.name));

/** A contract slot, in code. Throws on a name the contract lacks, so prose cannot name a dead slot. */
function slot(name: string): string {
  if (!SLOT_NAMES.has(name)) throw new Error(`DESIGN.md: "${name}" is not a contract slot`);
  return `\`${name}\``;
}

function codeList(names: readonly string[]): string {
  return names.map((n) => `\`${n}\``).join(", ");
}

function slotsNamed(prefix: string): string[] {
  return CONTRACT.filter((s) => s.name.startsWith(prefix)).map((s) => s.name);
}

/** What each colour group of the contract is for; every group must have a line. */
const COLOR_GROUP_ROLES: Partial<Record<ContractGroup, string>> = {
  surfaces: "the page, raised surfaces and floating surfaces",
  brand: "actions, from the primary fill to the quieter ones",
  support: "recessed wells, the destructive action, status, lines and focus",
  charts: "data-viz series, in order",
};

const MOTION_ROLES: Record<string, string> = {
  "motion-instant": "hover and focus feedback",
  "motion-fast": "reveals (menus, tooltips)",
  "motion-normal": "panels and sheets",
};

const WEIGHT_ROLES: Record<(typeof FONT_WEIGHTS)[number], string> = {
  normal: "running text",
  medium: "controls and labels",
  semibold: "titles",
  bold: "strong emphasis, sparingly",
};

function colorsSection(): string {
  const colorSlots = CONTRACT.filter((s) => s.type === "color");
  const groups = [...new Set(colorSlots.map((s) => s.group))].filter((g) => g !== "extended");
  const groupLines = groups.map((group) => {
    const role = COLOR_GROUP_ROLES[group];
    if (role === undefined) throw new Error(`DESIGN.md: no role for colour group "${group}"`);
    const names = colorSlots.filter((s) => s.group === group).map((s) => s.name);
    return `- **${group.charAt(0).toUpperCase() + group.slice(1)}** (${role}): ${codeList(names)}.`;
  });
  const extended = colorSlots.filter((s) => s.group === "extended").map((s) => s.name);
  const pairLines = CONTRAST_PAIRS.map(([fg, bg]) => `- \`${fg}\` on \`${bg}\``);
  return [
    "## Colors",
    "Paint from contract slots, never from a raw color value. The front matter lists the light scope under the slot names and the dark scope as `dark-*`; code names the slot once and the scope follows `.dark`.",
    [
      ...groupLines,
      `- **Extended** (optional in a theme, with a neutral default): ${codeList(extended)}.`,
    ].join("\n"),
    "Every `*-foreground` is paired with one surface and sits on that surface only. `theme-compile` checks each pair for WCAG AA (4.5:1) in both scopes:",
    pairLines.join("\n"),
    "Roles:",
    [
      `- ${slot("primary")} is the main action: primary button fills and emphasized controls. ${slot("destructive")} is reserved for irreversible actions, and error states reuse it so an error and a destructive action speak with one voice.`,
      `- ${slot("muted-foreground")} is subdued text on ${slot("background")}, ${slot("card")} or ${slot("muted")}, never on a filled ${slot("primary")} or ${slot("secondary")}.`,
      `- ${slot("info")}, ${slot("success")} and ${slot("warning")} carry the hue of a state, not of an action: a status surface tints itself with them against ${slot("card")}.`,
      `- Status hues and ${codeList(slotsNamed("chart-"))} carry meaning. Never use them for decoration.`,
      `- ${slot("border")} separates, ${slot("input")} strokes form controls, and ${slot("ring")} is the focus indicator.`,
      `- ${slot("overlay")} is the scrim behind a dialog or command palette, painted over a blur of the page. Never mix it from ${slot("foreground")}.`,
    ].join("\n"),
  ].join("\n\n");
}

function typographySection(): string {
  const ui = TYPE_STEPS.filter((s) => s.startsWith("ui-"));
  const content = TYPE_STEPS.filter((s) => !s.startsWith("ui-"));
  const sizes = ["sm", "md", "lg"].map((size) => {
    slot(`text-ui-${size}`);
    return `ui-${size}`;
  });
  slot("text-ui-xs");
  const weightLines = FONT_WEIGHTS.map((w) => {
    slot(`font-weight-${w}`);
    return `- \`font-weight-${w}\`: ${WEIGHT_ROLES[w]}.`;
  });
  return [
    "## Typography",
    `${slot("font-sans")} sets the interface and running text, and is the \`fontFamily\` of every style in the front matter. ${slot("font-serif")} is the display face for headings and pull quotes when the brand has one. ${slot("font-mono")} sets code.`,
    "The type scale is a size and a line height per step (`--text-<step>`, `--leading-<step>`), in two ramps:",
    [
      `- **Interface** (${codeList(ui)}): a component's \`sm\`/\`md\`/\`lg\` sizes read ${codeList(sizes)}, so controls grow one step at a time. \`ui-md\` is the default text of the interface, and \`ui-xs\` carries ticks and helper text.`,
      `- **Content** (${codeList(content)}): running text, lead paragraphs and titles.`,
    ].join("\n"),
    "Weights (`--font-weight-*`):",
    weightLines.join("\n"),
    "Use a step and a weight, never a raw size or weight. A size the scale lacks is a change to the contract, not a local exception.",
  ].join("\n\n");
}

function layoutSection(): string {
  const spacing = slotsNamed("spacing-");
  const containers = slotsNamed("container-");
  return [
    "## Layout",
    `Spacing uses the contract's scale, ${slot(spacing[0]!)} to ${slot(spacing.at(-1)!)} (the front matter's \`spacing\`). Component heights and gaps compose from the same steps.`,
    [
      "- Reference the scale by step, never a raw length.",
      "- Do not introduce one-off spacing exceptions.",
      `- Blocks and screens respond to the width of their container, never the viewport: ${codeList(containers)}, as the \`@sm:\`/\`@md:\`/\`@lg:\` container variants.`,
      "- Only a primitive that changes shape on a small screen (a dialog presented as a bottom sheet) may use a viewport media query.",
    ].join("\n"),
  ].join("\n\n");
}

function elevationSection(): string {
  const motionLines = slotsNamed("motion-").map((name) => {
    const role = MOTION_ROLES[name];
    if (role === undefined) throw new Error(`DESIGN.md: no role for --${name}`);
    return `- \`${name}\`: ${role}.`;
  });
  return [
    "## Elevation & Depth",
    `Resting surfaces separate by fill and a ${slot("border")}, not by shadow: ${slot("muted")} recesses, ${slot("card")} sits at page level. Shadows (${codeList(slotsNamed("shadow-"))}) are for overlays only (popover, menu, drawer, toast), one step per layer of float. The dark scope carries its own shadows, since a light-mode shadow disappears on a dark surface.`,
    "Motion durations:",
    motionLines.join("\n"),
  ].join("\n\n");
}

function shapesSection(): string {
  return [
    "## Shapes",
    `\`rounded.base\` (${slot("radius")}) shapes buttons, inputs, cards and surfaces. \`rounded.full\` (${slot("radius-full")}) is for pills, badges, avatars and status dots. Never set a corner radius by hand.`,
  ].join("\n\n");
}

function componentsSection(): string {
  return [
    "## Components",
    "Components are never edited: they are themed through the contract slots and varied through props, which resolve to `data-*` attributes on the root part.",
    [
      "- Every component must define states for default, hover, focus-visible, active, disabled, loading, and error.",
      "- Interactive components must document keyboard, pointer, and touch behavior.",
      "- Include long-content, overflow, and empty-state handling.",
      "- Component behavior should specify responsive and edge-case handling.",
    ].join("\n"),
    "Key patterns:",
    [
      `- **Button**: ${slot("primary")} fill with ${slot("primary-foreground")} text for the main action. \`secondary\` and \`outline\` are the quieter actions, and \`destructive\` is reserved for irreversible ones. Sizes step through \`ui-sm\`/\`ui-md\`/\`ui-lg\`.`,
      `- **Card**: a ${slot("card")} fill with a ${slot("border")}. \`muted\` is the recessed well, and \`ghost\` keeps the anatomy with no surface of its own.`,
      `- **Field**: an ${slot("input")} stroke that turns to ${slot("ring")} on hover and to ${slot("destructive")} when invalid, with a ${slot("ring")} outline on focus. Label and helper text follow the field's size step.`,
      `- **Dialog**: an overlay over the ${slot("overlay")} scrim, titled in \`body-lg\`.`,
    ].join("\n"),
  ].join("\n\n");
}

function dosAndDontsSection(name: string): string {
  return [
    "## Do's and Don'ts",
    [
      "- **Do** use semantic tokens, not raw color values, in component guidance and code.",
      "- **Do** define states for default, hover, focus-visible, active, disabled, loading, and error on every component.",
      "- **Do** document keyboard, pointer, and touch behavior for interactive components.",
      "- **Do** make accessibility acceptance criteria testable in implementation.",
      `- **Do** change a value in the theme's source (\`registry/themes/${name}/tokens.dtcg.json\`, or the Theme Builder) and rebuild. Never edit the front matter or \`theme.css\`.`,
      "- **Don't** allow low-contrast text or hidden focus indicators.",
      "- **Don't** introduce one-off spacing or typography exceptions.",
      "- **Don't** use ambiguous labels or non-descriptive actions.",
      "- **Don't** ship component guidance without explicit state rules.",
      "- **Don't** put a `*-foreground` on any surface but its own.",
    ].join("\n"),
  ].join("\n\n");
}

function accessibilitySection(): string {
  return [
    "## Accessibility",
    [
      "- Target: WCAG 2.2 AA.",
      "- Keyboard-first interactions required.",
      `- Focus must be visible: every focusable element shows the ${slot("ring")} on \`:focus-visible\`.`,
      "- Contrast constraints required: text uses only the foreground/surface pairs listed under Colors.",
    ].join("\n"),
  ].join("\n\n");
}

function authoringSection(): string {
  return [
    "## Guideline Authoring",
    "### Workflow",
    [
      "1. Restate design intent in one sentence.",
      "2. Define foundations and semantic tokens.",
      "3. Define component anatomy, variants, interactions, and state behavior.",
      "4. Add accessibility acceptance criteria with pass/fail checks.",
      "5. Add anti-patterns, migration notes, and edge-case handling.",
      "6. End with a QA checklist.",
    ].join("\n"),
    "### Required Output Structure",
    [
      "- Context and goals.",
      "- Design tokens and foundations.",
      "- Component-level rules (anatomy, variants, states, responsive behavior).",
      "- Accessibility requirements and testable acceptance criteria.",
      "- Content and tone standards with examples.",
      "- Anti-patterns and prohibited implementations.",
      "- QA checklist.",
    ].join("\n"),
    "### Quality Gates",
    [
      '- Every non-negotiable rule must use "must".',
      '- Every recommendation should use "should".',
      "- Every accessibility rule must be testable in implementation.",
      "- Teams should prefer system consistency over local visual exceptions.",
    ].join("\n"),
  ].join("\n\n");
}

function overviewIntro(doc: ThemeDoc): string {
  const name = themeName(doc);
  const brand = brandOf(doc);
  const scope =
    brand === null
      ? `\`${name}\` is a brand-less theme: it paints \`:root\` (light) and \`.dark\` (dark) and replaces the neutral defaults of \`@moderno-ui/tokens\`, so a project installs one such theme.`
      : `\`${name}\` is a branded theme: it paints under \`[data-brand="${brand}"]\`, composed with \`.dark\`, beside the project's default theme. Everything inside an element with \`data-brand="${brand}"\` takes this brand.`;
  return [
    "## Overview",
    scope,
    "The front matter holds the theme's values, and every slot the theme leaves out appears at the neutral default it inherits. The sections after this one are the rules every Moderno theme shares, derived from the token contract (`CONTRACT.md`): they name slots and never restate values. What sets this theme apart is in its brand notes, below.",
  ].join("\n\n");
}

// — Brand notes —

function checkBrandNotes(notes: string): string {
  if (/^#{1,2}\s/m.test(notes)) {
    throw new Error("DESIGN.md: brand notes may use ### headings and below, not # or ##");
  }
  if (notes.includes(BRAND_NOTES_START) || notes.includes(BRAND_NOTES_END)) {
    throw new Error("DESIGN.md: brand notes may not contain the brand-notes markers");
  }
  return notes;
}

/** The hand-written text between the brand-notes markers, or null when there is none. */
export function readBrandNotes(markdown: string): string | null {
  const start = markdown.indexOf(BRAND_NOTES_START);
  if (start === -1) return null;
  const from = start + BRAND_NOTES_START.length;
  const end = markdown.indexOf(BRAND_NOTES_END, from);
  if (end === -1) return null;
  const notes = markdown
    .slice(from, end)
    .replace(/^[ \t]*\n+/, "")
    .replace(/\n+$/, "");
  return notes.trim() === "" ? null : notes;
}

const GENERIC_FAMILIES = new Set([
  "ui-sans-serif",
  "ui-serif",
  "ui-monospace",
  "system-ui",
  "-apple-system",
  "sans-serif",
  "serif",
  "monospace",
]);

/** Chroma below this reads as grey. */
const ACHROMATIC = 0.02;

function hueName(h: number): string {
  const names: Array<[number, string]> = [
    [20, "pink"],
    [50, "red"],
    [80, "orange"],
    [110, "yellow"],
    [165, "green"],
    [215, "teal"],
    [285, "blue"],
    [330, "violet"],
    [360, "magenta"],
  ];
  return names.find(([limit]) => h % 360 < limit)![1];
}

/** A radius in rem, or NaN when it is neither px nor rem. */
function remOf(value: string): number {
  const m = value.trim().match(/^(-?[\d.]+)(rem|px)?$/);
  if (!m) return NaN;
  const n = parseFloat(m[1]!);
  return m[2] === "px" ? n / 16 : n;
}

/** Each layer of a box-shadow, as its leading lengths (x, y, blur, spread). */
function shadowLayers(value: string): number[][] {
  const layers: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of value) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      layers.push(current);
      current = "";
    } else current += ch;
  }
  layers.push(current);
  return layers.map((layer) =>
    layer
      .replace(/\w+\([^)]*\)/g, "")
      .trim()
      .split(/\s+/)
      .filter((t) => /^-?[\d.]+(px|rem)?$/.test(t))
      .map((t) => parseFloat(t)),
  );
}

/**
 * A first draft of a theme's brand notes, read off its values: where it
 * paints, its color character, its faces, its corners, its depth and its
 * contrast. Descriptive only, so a person can rewrite it in the brand's words.
 */
export function draftBrandNotes(doc: unknown, defaults: Defaults): string {
  const theme = asThemeDoc(doc);
  const { light, dark } = resolver(theme, defaults);
  const brand = brandOf(theme);
  const lines: string[] = [];

  lines.push(
    brand === null
      ? "- **Scope**: the project's default brand, at `:root` and `.dark`."
      : `- **Scope**: an alternate brand under \`[data-brand="${brand}"]\`, beside the default one.`,
  );

  const surfaces = CONTRACT.filter(
    (s) => s.type === "color" && (s.group === "surfaces" || s.group === "brand"),
  ).map((s) => s.name);
  const chroma = (v: string | undefined) => (v === undefined ? 0 : (parseOklch(v)?.c ?? 0));
  const tinted = [...surfaces, "muted", "border"].filter(
    (s) => chroma(light(s)) >= ACHROMATIC || chroma(dark(s)) >= ACHROMATIC,
  );
  const primary = parseOklch(required("primary", light("primary")));
  if (tinted.length === 0) {
    lines.push(
      "- **Color**: monochrome. Surfaces, actions and lines are greys; status hues and `chart-*` carry the only chroma.",
    );
  } else if (primary && primary.c >= ACHROMATIC) {
    lines.push(
      `- **Color**: a ${hueName(primary.h)} \`primary\` carries the brand and the main action.`,
    );
  } else {
    lines.push(`- **Color**: tinted surfaces (${codeList(tinted)}) around a neutral \`primary\`.`);
  }

  const sans = primaryFamily(required("font-sans", light("font-sans")));
  const serif = theme.light["font-serif"]?.$value;
  const faces = GENERIC_FAMILIES.has(sans) ? "set in the system font stack" : `set in **${sans}**`;
  lines.push(
    serif === undefined
      ? `- **Type**: ${faces}, with no display face of its own.`
      : `- **Type**: ${faces}, with **${primaryFamily(serif)}** as the display face.`,
  );

  const radius = remOf(required("radius", light("radius")));
  if (radius === 0) {
    lines.push(
      "- **Shape**: sharp. Surfaces and controls are square-cornered; only `rounded.full` rounds.",
    );
  } else if (radius <= 0.25) {
    lines.push("- **Shape**: subtly rounded corners on surfaces and controls.");
  } else if (Number.isFinite(radius)) {
    lines.push("- **Shape**: soft, rounded corners on surfaces and controls.");
  }

  const shadows = slotsNamed("shadow-").flatMap((s) => shadowLayers(light(s) ?? ""));
  const isRing = (l: number[]) => l.length >= 4 && l[0] === 0 && l[1] === 0 && l[2] === 0;
  if (shadows.length > 0 && shadows.every(isRing)) {
    lines.push("- **Depth**: overlays lift on hard outline rings, with no soft shadow.");
  } else if (shadows.some(isRing)) {
    lines.push("- **Depth**: each shadow step pairs a hairline ring with a soft drop.");
  } else {
    lines.push("- **Depth**: soft drop shadows on overlays.");
  }

  const ratios = CONTRAST_PAIRS.flatMap(([fg, bg]) => [
    contrastRatio(light(fg) ?? "", light(bg) ?? ""),
    contrastRatio(dark(fg) ?? "", dark(bg) ?? ""),
  ]).filter(Number.isFinite);
  if (ratios.length > 0 && Math.min(...ratios) >= 7) {
    lines.push(
      "- **Contrast**: every foreground/surface pair clears WCAG AAA (7:1) in both scopes.",
    );
  }

  return [
    "_Draft derived from the theme's values. Review it, then rewrite it in the brand's own words._",
    lines.join("\n"),
  ].join("\n\n");
}

// — The document —

/**
 * The full DESIGN.md for a theme. `brandNotes` are kept verbatim (read them
 * from the current file with `readBrandNotes`); without them a draft is derived
 * from the theme's values.
 */
export function renderDesignMd(
  doc: unknown,
  defaults: Defaults,
  options: { brandNotes?: string | null } = {},
): string {
  const theme = asThemeDoc(doc);
  const name = themeName(theme);
  const notes = checkBrandNotes(options.brandNotes ?? draftBrandNotes(theme, defaults));
  return (
    [
      renderFrontMatter(theme, defaults),
      `<!-- Generated by \`pnpm theme:build\` from registry/themes/${name}/tokens.dtcg.json and the Moderno token contract. Only the brand notes are hand-written: edit them between the markers below; everything outside the markers is regenerated. -->`,
      overviewIntro(theme),
      BRAND_NOTES_START,
      notes,
      BRAND_NOTES_END,
      colorsSection(),
      typographySection(),
      layoutSection(),
      elevationSection(),
      shapesSection(),
      componentsSection(),
      dosAndDontsSection(name),
      accessibilitySection(),
      authoringSection(),
    ].join("\n\n") + "\n"
  );
}
