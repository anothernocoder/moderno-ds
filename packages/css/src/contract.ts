/**
 * @moderno-ui/css/contract — the token contract as data.
 *
 * The single machine-readable source of the CONTRACT.md slot contract. Every
 * other slot list in the repo derives from this one: `tokens.css` is asserted
 * against it in tests, `@moderno-ui/theme-compile` derives its required slots and
 * WCAG contrast pairs, and the docs Theme Builder derives its editor groups.
 * Adding a slot here is the *only* edit — the derivations follow.
 *
 * Shipped as source (no bundler step), consistent with the CSS-first toolchain
 * decision in ADR-0001.
 */

/** DTCG `$type` a slot serialises to in a theme's `tokens.dtcg.json`. */
export type ContractSlotType =
  | "color"
  | "dimension"
  | "fontFamily"
  | "fontWeight"
  | "duration"
  | "shadow";

/**
 * Where a slot lives in the Theme Builder editor. `extended` slots ship a
 * neutral default in `@moderno-ui/css`: a theme *may* override them but is
 * not required to, so the editor surfaces them as optional fields (blank =
 * inherit the neutral default) while `other` slots are mandatory.
 */
export type ContractGroup = "surfaces" | "brand" | "support" | "charts" | "other" | "extended";

export interface ContractSlot {
  /** Custom-property name without the leading `--`. */
  name: string;
  type: ContractSlotType;
  group: ContractGroup;
  /** For a foreground slot: the background slot WCAG AA is checked against. */
  contrastAgainst?: string;
}

const color = (name: string, group: ContractGroup, contrastAgainst?: string): ContractSlot =>
  contrastAgainst
    ? { name, type: "color", group, contrastAgainst }
    : { name, type: "color", group };

/**
 * Steps of the type scale, smallest first. Each step is two slots:
 * `--text-<step>` (font size) and `--leading-<step>` (line height). The names
 * stay clear of Tailwind's own `--text-*` keys (`xs`, `sm`, `base`, `lg`…), so
 * the unlayered `:root` in tokens.css never resizes a stock `text-sm`.
 */
export const TYPE_STEPS = [
  "ui-xs",
  "ui-sm",
  "ui-md",
  "ui-lg",
  "body",
  "body-lg",
  "heading-sm",
  "heading",
  "heading-lg",
] as const;

/**
 * Font weights, lightest first: `--font-weight-<weight>`. Unlike the type steps,
 * these deliberately *are* Tailwind's own keys, at its values: the unlayered
 * `:root` in tokens.css beats Tailwind's `@layer theme` defaults, so a stock
 * `font-medium` follows a theme's override and, by default, changes nothing.
 */
export const FONT_WEIGHTS = ["normal", "medium", "semibold", "bold"] as const;

/** The full contract, in editor display order. */
export const CONTRACT: readonly ContractSlot[] = [
  // — Surfaces —
  color("background", "surfaces"),
  color("foreground", "surfaces", "background"),
  color("card", "surfaces"),
  color("card-foreground", "surfaces", "card"),
  color("popover", "surfaces"),
  color("popover-foreground", "surfaces", "popover"),
  // — Brand —
  color("primary", "brand"),
  color("primary-foreground", "brand", "primary"),
  color("secondary", "brand"),
  color("secondary-foreground", "brand", "secondary"),
  color("accent", "brand"),
  color("accent-foreground", "brand", "accent"),
  // — Support —
  color("muted", "support"),
  color("muted-foreground", "support", "muted"),
  color("destructive", "support"),
  color("destructive-foreground", "support", "destructive"),
  /*
   * Status hues. `--destructive` covers the error case for *actions* (a delete
   * button); a status surface additionally needs a positive, a cautionary and an
   * informational hue. Without them a component with info/success/warning/error
   * variants (Alert, Callout, Badge…) could only be painted from literals, which
   * the golden rule forbids. Themed like every other slot: a brand re-maps them
   * and every status surface follows.
   */
  color("info", "support"),
  color("info-foreground", "support", "info"),
  color("success", "support"),
  color("success-foreground", "support", "success"),
  color("warning", "support"),
  color("warning-foreground", "support", "warning"),
  color("border", "support"),
  color("input", "support"),
  color("ring", "support"),
  // — Data viz —
  color("chart-1", "charts"),
  color("chart-2", "charts"),
  color("chart-3", "charts"),
  color("chart-4", "charts"),
  color("chart-5", "charts"),
  // — Non-colour slots every theme must define —
  { name: "radius", type: "dimension", group: "other" },
  { name: "font-sans", type: "fontFamily", group: "other" },
  { name: "font-mono", type: "fontFamily", group: "other" },
  // — Extended contract: base-only defaults, not required in themes —
  { name: "spacing-1", type: "dimension", group: "extended" },
  { name: "spacing-2", type: "dimension", group: "extended" },
  { name: "spacing-3", type: "dimension", group: "extended" },
  { name: "spacing-4", type: "dimension", group: "extended" },
  { name: "spacing-5", type: "dimension", group: "extended" },
  { name: "spacing-6", type: "dimension", group: "extended" },
  { name: "spacing-7", type: "dimension", group: "extended" },
  { name: "spacing-8", type: "dimension", group: "extended" },
  { name: "motion-instant", type: "duration", group: "extended" },
  { name: "motion-fast", type: "duration", group: "extended" },
  { name: "motion-normal", type: "duration", group: "extended" },
  { name: "radius-full", type: "dimension", group: "extended" },
  // Display face: headings and pull quotes; the brand's serif in theme-moderno.
  { name: "font-serif", type: "fontFamily", group: "extended" },
  // Elevation: three steps for overlays (popover, menu, drawer, toast).
  { name: "shadow-sm", type: "shadow", group: "extended" },
  { name: "shadow-md", type: "shadow", group: "extended" },
  { name: "shadow-lg", type: "shadow", group: "extended" },
  // Modal scrim: the dimming layer behind a dialog or command palette. A colour
  // slot, but extended — every theme inherits the neutral black wash unless its
  // brand wants a tinted one.
  { name: "overlay", type: "color", group: "extended" },
  // Container breakpoints: what blocks and screens respond to (ADR-0005).
  { name: "container-sm", type: "dimension", group: "extended" },
  { name: "container-md", type: "dimension", group: "extended" },
  { name: "container-lg", type: "dimension", group: "extended" },
  // Type scale: a font size and its line height per step. The ui-* ramp is what
  // controls size with (sm/md/lg → 13/14/15); body and heading steps set content.
  ...TYPE_STEPS.flatMap((step): ContractSlot[] => [
    { name: `text-${step}`, type: "dimension", group: "extended" },
    { name: `leading-${step}`, type: "dimension", group: "extended" },
  ]),
  // Font weights: 400/500/600/700, the ramp components and blocks set text in.
  ...FONT_WEIGHTS.map(
    (weight): ContractSlot => ({
      name: `font-weight-${weight}`,
      type: "fontWeight",
      group: "extended",
    }),
  ),
];

/**
 * Colour slots every theme must define in both scopes (CONTRACT.md minimum).
 * An extended colour slot (`--overlay`) is not one of them: it has a default.
 */
export const COLOR_SLOTS: readonly string[] = CONTRACT.filter(
  (s) => s.type === "color" && s.group !== "extended",
).map((s) => s.name);

/** Non-colour slots every theme must define (radius + font stacks). */
export const OTHER_SLOTS: readonly string[] = CONTRACT.filter((s) => s.group === "other").map(
  (s) => s.name,
);

/** Slots `@moderno-ui/css` gives a default; a theme overrides them or not. */
export const EXTENDED_SLOTS: readonly string[] = CONTRACT.filter((s) => s.group === "extended").map(
  (s) => s.name,
);

/** `[foreground, background]` contract pairs WCAG AA (4.5:1) is checked against. */
export const CONTRAST_PAIRS: ReadonlyArray<readonly [fg: string, bg: string]> = CONTRACT.filter(
  (s) => s.contrastAgainst !== undefined,
).map((s) => [s.name, s.contrastAgainst!] as const);

/**
 * Colour slots grouped for the Theme Builder editor, in display order. The
 * group list derives from the contract too, so a colour slot under a new
 * group surfaces in the editor without touching this file.
 */
const colorSlots = CONTRACT.filter((s) => COLOR_SLOTS.includes(s.name));
export const COLOR_GROUPS: ReadonlyArray<{ group: ContractGroup; slots: readonly string[] }> = [
  ...new Set(colorSlots.map((s) => s.group)),
].map((group) => ({
  group,
  slots: colorSlots.filter((s) => s.group === group).map((s) => s.name),
}));

const typeByName = new Map(CONTRACT.map((s) => [s.name, s.type]));

/** DTCG `$type` for a slot name. Unknown slots default to `color`. */
export function slotType(name: string): ContractSlotType {
  return typeByName.get(name) ?? "color";
}
