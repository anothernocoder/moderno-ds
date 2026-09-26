import { cva, type VariantProps } from "../cva.js";

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

/** Avatar's size. */
export type AvatarSize = NonNullable<VariantProps<typeof avatarRecipe.variants>["size"]>;

/** Avatar's outline (`circle`, `square`). */
export type AvatarShape = NonNullable<VariantProps<typeof avatarRecipe.variants>["shape"]>;
