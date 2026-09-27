import { cva, type VariantProps } from "../cva.js";

/**
 * RadioGroup: `variant` × `size`, plus the `aspectRatio` of a tile's media.
 * `list` is the classic radio circle beside its text; `tile` lays the items
 * out as selectable cards in a grid, each with a media slot above its text.
 * Orientation is Ark's own `orientation` prop, stamped as `data-orientation`;
 * checked, disabled, invalid and read-only are Ark's `data-state`/`data-*`.
 * None of them is a variant. `columns` is a number, which `cva` does not
 * model, so `radioGroupAttrs` adds it beside the recipe's attributes.
 */
export const radioGroupRecipe = cva({
  variants: {
    variant: ["list", "tile"],
    size: ["sm", "md", "lg"],
    aspectRatio: ["16:9", "4:3", "3:2", "1:1", "3:4", "9:16"],
  },
  defaultVariants: { variant: "list", size: "md" },
});

/** RadioGroup's layout (`list` of radios, or `tile` cards in a grid). */
export type RadioGroupVariant = NonNullable<
  VariantProps<typeof radioGroupRecipe.variants>["variant"]
>;

/** RadioGroup's density (radio circle and item text). */
export type RadioGroupSize = NonNullable<VariantProps<typeof radioGroupRecipe.variants>["size"]>;

/** The shape of every tile's media (`ItemMedia`); `16:9` when unset. */
export type RadioGroupAspectRatio = NonNullable<
  VariantProps<typeof radioGroupRecipe.variants>["aspectRatio"]
>;

/** The column counts a `tile` grid can be fixed to. */
export const radioGroupColumns = [1, 2, 3, 4, 5, 6] as const;

/** How many columns a `tile` grid is fixed to; unset, the cards fill the row. */
export type RadioGroupColumns = (typeof radioGroupColumns)[number];

/** What a RadioGroup's root is styled from: the recipe's props plus `columns`. */
export interface RadioGroupAttrsProps {
  variant?: RadioGroupVariant;
  size?: RadioGroupSize;
  aspectRatio?: RadioGroupAspectRatio;
  /** Fix a `tile` grid to this many columns. */
  columns?: RadioGroupColumns;
}

/**
 * The `data-*` attributes of a RadioGroup's root: `radioGroupRecipe`'s
 * `data-variant`/`data-size`/`data-aspect-ratio`, plus `data-columns` when
 * `columns` is set. Lives beside the recipe so all four bindings turn the
 * number into the same attribute and reject the same out-of-range value.
 */
export function radioGroupAttrs({
  variant,
  size,
  aspectRatio,
  columns,
}: RadioGroupAttrsProps = {}): Record<string, string> {
  const attrs = radioGroupRecipe({ variant, size, aspectRatio });
  if (columns === undefined) return attrs;
  if (!radioGroupColumns.includes(columns)) {
    throw new Error(
      `[radioGroupAttrs] invalid value "${columns}" for "columns"; expected one of: ${radioGroupColumns.join(", ")}`,
    );
  }
  return { ...attrs, "data-columns": String(columns) };
}
