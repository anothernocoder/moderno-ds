/**
 * Component recipes — the variant tables shared by every framework binding.
 *
 * A recipe is just a `cva` instance: it maps public props to deterministic
 * `data-*` attributes on a component's root part. Recipes live in `@moderno-ui/core`
 * (not in the React/Vue/Svelte/Solid packages) so all bindings resolve variants
 * identically — the framework only differs in how it spreads the attributes onto
 * markup. `components.css` styles those attributes; the recipe and the stylesheet
 * are the two halves of one contract.
 *
 * Visual states that Ark already tracks (invalid, disabled, highlighted, open)
 * are NOT recipe variants — they surface as Ark's own `data-*` attributes and
 * are styled directly. Recipes only carry the choices a consumer makes via props.
 */

import { cva, type VariantProps } from "./cva.js";

/** Button: visual `variant` × `size`. The canonical recipe Phases 3–4 replicate. */
export const buttonRecipe = cva({
  variants: {
    variant: ["primary", "secondary", "outline", "ghost", "destructive"],
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { variant: "primary", size: "md" },
});

/**
 * Card: surface `variant` × padding `size`. A CSS-only primitive — no Ark
 * machine exists for a card, so this recipe is its entire behavioural surface
 * and `components.css` paints every part from `[data-scope="card"]`.
 */
export const cardRecipe = cva({
  variants: {
    variant: ["outline", "muted", "ghost"],
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { variant: "outline", size: "md" },
});

/**
 * Checkbox: control `size` (the box + label density). Checked, indeterminate,
 * disabled and invalid are Ark's own `data-state`/`data-*`, not variants.
 */
export const checkboxRecipe = cva({
  variants: {
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { size: "md" },
});

/**
 * Divider: `orientation` (the rule's axis) × `align` (where an optional label
 * sits along it). Both are consumer choices, so both are recipe variants; the
 * rule itself is drawn by `components.css` from the `--border` slot.
 */
export const dividerRecipe = cva({
  variants: {
    orientation: ["horizontal", "vertical"],
    align: ["start", "center", "end"],
  },
  defaultVariants: { orientation: "horizontal", align: "center" },
});

/** Select: control `size` (the trigger/menu density). Selection state is Ark's. */
export const selectRecipe = cva({
  variants: {
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { size: "md" },
});

/**
 * Field: control `size` — the density of the whole field (label, control,
 * helper/error text), carried on the root so one attribute sizes every part.
 * Invalid/disabled/required stay Ark's own data-attributes, not variants.
 */
export const fieldRecipe = cva({
  variants: {
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { size: "md" },
});

/**
 * PinInput: cell `size` (the width/height of every code cell). Everything else
 * the one-time-code input expresses visually — a filled cell, a complete code,
 * an invalid entry, a disabled control — is Ark's own `data-filled` /
 * `data-complete` / `data-invalid` / `data-disabled`, not a variant.
 */
export const pinInputRecipe = cva({
  variants: {
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { size: "md" },
});

/**
 * Alert: status `variant` × `size`. There is no Ark machine — an alert is a
 * static region, so every attribute it carries comes from this recipe.
 * `components.css` tints the surface from the matching contract status slot
 * (`--info`/`--success`/`--warning`, and `--destructive` for `error`, so a
 * destructive action and an error message speak with one voice).
 */
export const alertRecipe = cva({
  variants: {
    variant: ["info", "success", "warning", "error"],
    size: ["sm", "md"],
  },
  defaultVariants: { variant: "info", size: "md" },
});

/**
 * Callout: status `variant`. A softer notice than Alert — a note inside the
 * page's content, not a live status — so it has no size and no live-region
 * role. `components.css` paints a quiet `--muted` surface with a stripe on the
 * inline-start edge from the matching contract status slot
 * (`--info`/`--success`/`--warning`, and `--destructive` for `error`).
 */
export const calloutRecipe = cva({
  variants: {
    variant: ["info", "success", "warning", "error"],
  },
  defaultVariants: { variant: "info" },
});

/**
 * Badge: visual `variant` × `size`. A static label with no Ark machine, so
 * every attribute it carries comes from this recipe. The four statuses tint
 * from the same contract slots as Alert (`--info`/`--success`/`--warning`, and
 * `--destructive` for `error`).
 */
export const badgeRecipe = cva({
  variants: {
    variant: ["neutral", "solid", "outline", "info", "success", "warning", "error"],
    size: ["sm", "md"],
  },
  defaultVariants: { variant: "neutral", size: "md" },
});

/**
 * Chip: surface `variant` × `size`. A compact token that may be removed; the
 * remove button is a plain `<button>`, so there is no machine state to style —
 * only the consumer's choices below.
 */
export const chipRecipe = cva({
  variants: {
    variant: ["outline", "muted", "solid"],
    size: ["sm", "md"],
  },
  defaultVariants: { variant: "outline", size: "md" },
});

/**
 * Indicator: status `variant` × dot `size`. The optional pulse is a boolean,
 * which `cva` does not model (it resolves string enums), so `indicatorAttrs`
 * adds it beside the recipe's attributes.
 */
export const indicatorRecipe = cva({
  variants: {
    variant: ["neutral", "info", "success", "warning", "error"],
    size: ["sm", "md"],
  },
  defaultVariants: { variant: "neutral", size: "md" },
});

/**
 * Skeleton: the placeholder's `shape` — a line of `text`, a `rect` block or a
 * `circle` (an avatar). There is no size: a skeleton stands in for content the
 * consumer is about to render, so the consumer sizes it like that content.
 */
export const skeletonRecipe = cva({
  variants: {
    shape: ["text", "rect", "circle"],
  },
  defaultVariants: { shape: "text" },
});

/**
 * Spinner: ring `size`. An indeterminate spinner has no progress value, so
 * the size is the only choice a consumer makes; the colour follows the text
 * around it.
 */
export const spinnerRecipe = cva({
  variants: {
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { size: "md" },
});

/**
 * Avatar: `size` × `shape` (a `circle` for a person, a `square` for a team, a
 * workspace or a product). Whether the image or the initials fallback shows
 * is Ark's own `data-state` on those parts, not a variant.
 */
export const avatarRecipe = cva({
  variants: {
    size: ["sm", "md", "lg"],
    shape: ["circle", "square"],
  },
  defaultVariants: { size: "md", shape: "circle" },
});

/**
 * Switch: control `size` (the track, thumb and label density). On/off,
 * disabled, invalid and read-only are Ark's own `data-state`/`data-*`, not
 * variants.
 */
export const switchRecipe = cva({
  variants: {
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { size: "md" },
});

/**
 * RadioGroup: `size` (the radio circle and the item text density).
 * Orientation is Ark's own `orientation` prop, stamped as `data-orientation`;
 * checked, disabled, invalid and read-only are Ark's `data-state`/`data-*`.
 * None of them is a variant.
 */
export const radioGroupRecipe = cva({
  variants: {
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { size: "md" },
});

/**
 * Toggle: visual `variant` × `size` for a button that stays pressed. `ghost`
 * has no fill at rest; `outline` draws a border. Pressed and disabled are
 * Ark's own `data-state="on|off"` / `data-disabled`, not variants.
 */
export const toggleRecipe = cva({
  variants: {
    variant: ["ghost", "outline"],
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { variant: "ghost", size: "md" },
});

/**
 * ToggleGroup: `variant` × `size` on the root, which every item follows.
 * `ghost` sets the items apart; `outline` holds them in one bordered bar.
 * Orientation and single/multiple selection are Ark's own `orientation` and
 * `multiple` props; pressed and disabled are Ark's `data-state`/`data-*`.
 */
export const toggleGroupRecipe = cva({
  variants: {
    variant: ["ghost", "outline"],
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { variant: "ghost", size: "md" },
});

/*
 * The variant unions, derived once beside the recipes. Bindings import these
 * names instead of re-deriving them from the recipe tables — a recipe change
 * ripples to every framework through this seam.
 */

/** Button's visual style (`primary`, `outline`, …). */
export type ButtonVariant = NonNullable<VariantProps<typeof buttonRecipe.variants>["variant"]>;

/** Button's control density. */
export type ButtonSize = NonNullable<VariantProps<typeof buttonRecipe.variants>["size"]>;

/** Select's control density (trigger/menu). Selection state stays Ark's. */
export type SelectSize = NonNullable<VariantProps<typeof selectRecipe.variants>["size"]>;

/** Card's surface treatment (`outline`, `muted`, `ghost`). */
export type CardVariant = NonNullable<VariantProps<typeof cardRecipe.variants>["variant"]>;

/** Card's padding density. */
export type CardSize = NonNullable<VariantProps<typeof cardRecipe.variants>["size"]>;

/** Checkbox's control density (box + label). Checked state stays Ark's. */
export type CheckboxSize = NonNullable<VariantProps<typeof checkboxRecipe.variants>["size"]>;

/** Field's control density (label, input/textarea, helper and error text). */
export type FieldSize = NonNullable<VariantProps<typeof fieldRecipe.variants>["size"]>;

/** Alert's status (`info`, `success`, `warning`, `error`). */
export type AlertVariant = NonNullable<VariantProps<typeof alertRecipe.variants>["variant"]>;

/** Alert's density (`sm` compact, `md` default). */
export type AlertSize = NonNullable<VariantProps<typeof alertRecipe.variants>["size"]>;

/**
 * The ARIA role an Alert's root element takes for a status.
 *
 * Urgency is a property of the status, not a prop the consumer should have to
 * remember: `warning`/`error` interrupt (`role="alert"`, an assertive live
 * region), `info`/`success` report (`role="status"`, polite). It lives beside
 * the recipe so all four bindings resolve it identically — the same seam the
 * recipe itself provides for `data-*`. Consumers can still pass their own
 * `role`; every binding spreads consumer props over this default.
 */
export function alertRole(variant?: AlertVariant): "alert" | "status" {
  return variant === "warning" || variant === "error" ? "alert" : "status";
}
/** Callout's status (`info`, `success`, `warning`, `error`). */
export type CalloutVariant = NonNullable<VariantProps<typeof calloutRecipe.variants>["variant"]>;

/** Divider's axis (`horizontal`, `vertical`). */
export type DividerOrientation = NonNullable<
  VariantProps<typeof dividerRecipe.variants>["orientation"]
>;

/** Where a Divider's optional label sits along the rule. */
export type DividerAlign = NonNullable<VariantProps<typeof dividerRecipe.variants>["align"]>;
/** PinInput's cell density. Filled/complete/invalid stay Ark's. */
export type PinInputSize = NonNullable<VariantProps<typeof pinInputRecipe.variants>["size"]>;

/** Badge's visual style (`neutral`, `solid`, `outline`, or a status). */
export type BadgeVariant = NonNullable<VariantProps<typeof badgeRecipe.variants>["variant"]>;

/** Badge's density. */
export type BadgeSize = NonNullable<VariantProps<typeof badgeRecipe.variants>["size"]>;

/** Chip's surface treatment (`outline`, `muted`, `solid`). */
export type ChipVariant = NonNullable<VariantProps<typeof chipRecipe.variants>["variant"]>;

/** Chip's density. */
export type ChipSize = NonNullable<VariantProps<typeof chipRecipe.variants>["size"]>;

/** Indicator's status (`neutral`, `info`, `success`, `warning`, `error`). */
export type IndicatorVariant = NonNullable<
  VariantProps<typeof indicatorRecipe.variants>["variant"]
>;

/** Indicator's dot size. */
export type IndicatorSize = NonNullable<VariantProps<typeof indicatorRecipe.variants>["size"]>;

/** What an Indicator's root is styled from: the recipe's props plus `pulse`. */
export interface IndicatorAttrsProps {
  variant?: IndicatorVariant;
  size?: IndicatorSize;
  /** Animate a ring around the dot. */
  pulse?: boolean;
}

/**
 * The `data-*` attributes of an Indicator's root: `indicatorRecipe`'s
 * `data-variant`/`data-size`, plus a bare `data-pulse` when `pulse` is on.
 *
 * Lives beside the recipe (like `alertRole`) so all four bindings express the
 * boolean identically — a present-or-absent attribute, never `"false"`.
 */
export function indicatorAttrs({ variant, size, pulse }: IndicatorAttrsProps = {}): Record<
  string,
  string
> {
  const attrs = indicatorRecipe({ variant, size });
  return pulse ? { ...attrs, "data-pulse": "" } : attrs;
}

/**
 * The consumer attributes an Indicator's root receives. Only the naming
 * attributes are read; the rest are allowed so each binding can pass its
 * props or attrs object as is.
 */
export interface IndicatorNameAttrs {
  "aria-label"?: unknown;
  "aria-labelledby"?: unknown;
  [attribute: string]: unknown;
}

/**
 * The ARIA role an Indicator's root takes.
 *
 * With a label, the root is a plain `<span>` and the label text is the name.
 * A bare dot named by `aria-label` (or `aria-labelledby`) becomes
 * `role="img"`: ARIA 1.2 prohibits naming a generic `<span>`, so screen
 * readers would skip the name and the status would be colour alone. A bare
 * dot with no name stays decorative (no role). Consumers can still pass their
 * own `role`; every binding spreads consumer props over this default.
 */
export function indicatorRole(hasLabel: boolean, attrs: IndicatorNameAttrs): "img" | undefined {
  const named = Boolean(attrs["aria-label"] || attrs["aria-labelledby"]);
  return !hasLabel && named ? "img" : undefined;
}

/** Skeleton's placeholder shape (`text`, `rect`, `circle`). */
export type SkeletonShape = NonNullable<VariantProps<typeof skeletonRecipe.variants>["shape"]>;

/** Spinner's ring size. */
export type SpinnerSize = NonNullable<VariantProps<typeof spinnerRecipe.variants>["size"]>;

/** Avatar's size. */
export type AvatarSize = NonNullable<VariantProps<typeof avatarRecipe.variants>["size"]>;

/** Avatar's outline (`circle`, `square`). */
export type AvatarShape = NonNullable<VariantProps<typeof avatarRecipe.variants>["shape"]>;

/** Switch's density (track, thumb and label). */
export type SwitchSize = NonNullable<VariantProps<typeof switchRecipe.variants>["size"]>;

/** RadioGroup's density (radio circle and item text). */
export type RadioGroupSize = NonNullable<VariantProps<typeof radioGroupRecipe.variants>["size"]>;

/** Toggle's visual style (`ghost`, `outline`). */
export type ToggleVariant = NonNullable<VariantProps<typeof toggleRecipe.variants>["variant"]>;

/** Toggle's control density. */
export type ToggleSize = NonNullable<VariantProps<typeof toggleRecipe.variants>["size"]>;

/** ToggleGroup's visual style (`ghost`, `outline`), shared by its items. */
export type ToggleGroupVariant = NonNullable<
  VariantProps<typeof toggleGroupRecipe.variants>["variant"]
>;

/** ToggleGroup's density, shared by its items. */
export type ToggleGroupSize = NonNullable<VariantProps<typeof toggleGroupRecipe.variants>["size"]>;
