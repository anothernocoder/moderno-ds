import { cva, type VariantProps } from "../cva.js";

/** Button: visual `variant` × `size`. The canonical recipe Phases 3–4 replicate. */
export const buttonRecipe = cva({
  variants: {
    variant: ["primary", "secondary", "outline", "ghost", "destructive"],
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { variant: "primary", size: "md" },
});

/** Button's visual style (`primary`, `outline`, …). */
export type ButtonVariant = NonNullable<VariantProps<typeof buttonRecipe.variants>["variant"]>;

/** Button's control density. */
export type ButtonSize = NonNullable<VariantProps<typeof buttonRecipe.variants>["size"]>;
