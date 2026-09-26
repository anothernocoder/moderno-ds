import { cva, type VariantProps } from "../cva.js";

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

/** Badge's visual style (`neutral`, `solid`, `outline`, or a status). */
export type BadgeVariant = NonNullable<VariantProps<typeof badgeRecipe.variants>["variant"]>;

/** Badge's density. */
export type BadgeSize = NonNullable<VariantProps<typeof badgeRecipe.variants>["size"]>;
