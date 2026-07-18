/**
 * @moderno/tokens/contract — the token contract as data.
 *
 * The single machine-readable source of the CONTRACT.md slot contract. Every
 * other slot list in the repo derives from this one: `tokens.css` is asserted
 * against it in tests, `@moderno/theme-compile` derives its required slots and
 * WCAG contrast pairs, and the docs Theme Builder derives its editor groups.
 * Adding a slot here is the *only* edit — the derivations follow.
 *
 * Shipped as source (no bundler step), consistent with the CSS-first toolchain
 * decision in ADR-0001.
 */

/** DTCG `$type` a slot serialises to in a theme's `tokens.dtcg.json`. */
export type ContractSlotType = "color" | "dimension" | "fontFamily" | "duration";

/**
 * Where a slot lives in the Theme Builder editor. `extended` slots are
 * base-only defaults in `@moderno/tokens` — themes are not required to define
 * them and the editor does not surface them.
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
];

/** Colour slots every theme must define in both scopes (CONTRACT.md minimum). */
export const COLOR_SLOTS: readonly string[] = CONTRACT.filter((s) => s.type === "color").map(
  (s) => s.name,
);

/** Non-colour slots every theme must define (radius + font stacks). */
export const OTHER_SLOTS: readonly string[] = CONTRACT.filter((s) => s.group === "other").map(
  (s) => s.name,
);

/** Base-only slots shipped by `@moderno/tokens`, not required in themes. */
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
const colorSlots = CONTRACT.filter((s) => s.type === "color");
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
