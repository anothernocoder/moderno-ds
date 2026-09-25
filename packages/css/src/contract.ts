/**
 * @moderno-ui/css/contract — the token contract as data.
 *
 * The one hand-edited source of the contract's slots: their names, DTCG types,
 * groups, contrast pairs and roles (ADR-0008). CONTRACT.md holds the rules and
 * points here for the slots. Every other slot list in the repo derives from
 * this one: `@moderno-ui/theme-compile` holds the neutral defaults
 * (`tokens.dtcg.json`) to every slot and derives a theme's required slots, its
 * WCAG contrast pairs and each theme's DESIGN.md, the agent manifest carries
 * the roles, and the docs Theme Builder derives its editor groups.
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
  /** What the slot is for, in one line: a lowercase phrase with no final period. */
  role: string;
  /** For a foreground slot: the background slot WCAG AA is checked against. */
  contrastAgainst?: string;
}

/** What each group of the contract holds, in one line. */
export const GROUP_ROLES: Readonly<Record<ContractGroup, string>> = {
  surfaces: "the page, raised surfaces and floating surfaces",
  brand: "actions, from the primary fill to the quieter ones",
  support: "recessed wells, the destructive action, status, lines and focus",
  charts: "data-viz series, in order",
  other: "the base corner radius and the interface and code faces",
  extended: "optional in a theme, with a neutral default",
};

const color = (
  name: string,
  group: ContractGroup,
  role: string,
  contrastAgainst?: string,
): ContractSlot =>
  contrastAgainst
    ? { name, type: "color", group, role, contrastAgainst }
    : { name, type: "color", group, role };

/** A `*-foreground` slot: what sits on its surface, checked against it. */
const foreground = (surface: string, group: ContractGroup): ContractSlot =>
  color(`${surface}-foreground`, group, `text and icons on \`${surface}\``, surface);

const extended = (name: string, type: ContractSlotType, role: string): ContractSlot => ({
  name,
  type,
  group: "extended",
  role,
});

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

/** What each type step sets. The `ui-*` ramp is what a component's sizes read. */
export const TYPE_STEP_ROLES: Readonly<Record<(typeof TYPE_STEPS)[number], string>> = {
  "ui-xs": "the smallest interface text: ticks and helper text",
  "ui-sm": "a component's `sm` size",
  "ui-md": "a component's `md` size, and the default text of the interface",
  "ui-lg": "a component's `lg` size",
  body: "running text",
  "body-lg": "lead paragraphs and dialog titles",
  "heading-sm": "small titles",
  heading: "section titles",
  "heading-lg": "page titles",
};

/**
 * Font weights, lightest first: `--font-weight-<weight>`. Unlike the type steps,
 * these deliberately *are* Tailwind's own keys, at its values: the unlayered
 * `:root` in tokens.css beats Tailwind's `@layer theme` defaults, so a stock
 * `font-medium` follows a theme's override and, by default, changes nothing.
 */
export const FONT_WEIGHTS = ["normal", "medium", "semibold", "bold"] as const;

const WEIGHT_ROLES: Readonly<Record<(typeof FONT_WEIGHTS)[number], string>> = {
  normal: "running text",
  medium: "controls and labels",
  semibold: "titles",
  bold: "strong emphasis, sparingly",
};

const SPACING_STEPS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

/** The full contract, in editor display order. */
export const CONTRACT: readonly ContractSlot[] = [
  // — Surfaces —
  color("background", "surfaces", "the page surface"),
  color("foreground", "surfaces", "text and icons on `background`", "background"),
  color("card", "surfaces", "a raised surface: cards and panels"),
  foreground("card", "surfaces"),
  color("popover", "surfaces", "a floating surface: popovers, menus and select lists"),
  foreground("popover", "surfaces"),
  // — Brand —
  color("primary", "brand", "the main action: primary button fills and emphasized controls"),
  foreground("primary", "brand"),
  color("secondary", "brand", "a quieter action than `primary`"),
  foreground("secondary", "brand"),
  color("accent", "brand", "the hover and highlight surface of quiet controls and list items"),
  foreground("accent", "brand"),
  // — Support —
  color("muted", "support", "a recessed surface: wells and quiet backgrounds"),
  color("muted-foreground", "support", "subdued text on `background`, `card` or `muted`", "muted"),
  color("destructive", "support", "irreversible actions, and the error state"),
  foreground("destructive", "support"),
  color("info", "support", "the hue of an informational status"),
  foreground("info", "support"),
  color("success", "support", "the hue of a positive status"),
  foreground("success", "support"),
  color("warning", "support", "the hue of a cautionary status"),
  foreground("warning", "support"),
  color("border", "support", "borders and separators"),
  color("input", "support", "the stroke of form controls"),
  color("ring", "support", "the focus indicator"),
  // — Data viz —
  ...[1, 2, 3, 4, 5].map((n) => color(`chart-${n}`, "charts", `data-viz series ${n}`)),
  // — Non-colour slots every theme must define —
  {
    name: "radius",
    type: "dimension",
    group: "other",
    role: "the base corner radius: buttons, inputs, cards and surfaces",
  },
  {
    name: "font-sans",
    type: "fontFamily",
    group: "other",
    role: "the interface and running text",
  },
  { name: "font-mono", type: "fontFamily", group: "other", role: "code" },
  // — Extended contract: base-only defaults, not required in themes —
  ...SPACING_STEPS.map((n) =>
    extended(
      `spacing-${n}`,
      "dimension",
      `step ${n} of the spacing scale, where 1 is the smallest`,
    ),
  ),
  extended("motion-instant", "duration", "hover and focus feedback"),
  extended("motion-fast", "duration", "reveals: menus and tooltips"),
  extended("motion-normal", "duration", "panels and sheets"),
  extended(
    "radius-full",
    "dimension",
    "fully rounded ends: pills, badges, avatars and status dots",
  ),
  extended(
    "font-serif",
    "fontFamily",
    "the display face for headings and pull quotes, when the brand has one",
  ),
  extended("shadow-sm", "shadow", "the lowest float: tooltips and small overlays"),
  extended("shadow-md", "shadow", "menus, select lists and popovers"),
  extended("shadow-lg", "shadow", "the highest float: dialogs, drawers and toasts"),
  extended("overlay", "color", "the scrim behind a dialog or command palette"),
  extended("container-sm", "dimension", "the smallest container breakpoint (`@sm:`)"),
  extended("container-md", "dimension", "the middle container breakpoint (`@md:`)"),
  extended("container-lg", "dimension", "the largest container breakpoint (`@lg:`)"),
  ...TYPE_STEPS.flatMap((step): ContractSlot[] => [
    extended(
      `text-${step}`,
      "dimension",
      `the font size of the \`${step}\` step: ${TYPE_STEP_ROLES[step]}`,
    ),
    extended(
      `leading-${step}`,
      "dimension",
      `the line height of the \`${step}\` step, set with \`text-${step}\``,
    ),
  ]),
  ...FONT_WEIGHTS.map((weight) =>
    extended(`font-weight-${weight}`, "fontWeight", WEIGHT_ROLES[weight]),
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
