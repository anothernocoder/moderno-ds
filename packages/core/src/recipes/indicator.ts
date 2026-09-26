import { cva, type VariantProps } from "../cva.js";

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
