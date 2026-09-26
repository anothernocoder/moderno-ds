import { cva, type VariantProps } from "../cva.js";

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

/** Callout's status (`info`, `success`, `warning`, `error`). */
export type CalloutVariant = NonNullable<VariantProps<typeof calloutRecipe.variants>["variant"]>;
