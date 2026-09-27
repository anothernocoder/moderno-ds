import { cva, type VariantProps } from "../cva.js";

/**
 * TagsInput: control `size` — the height of the bordered box, of each tag in
 * it and the type of the label, the tags and the input. The value, the
 * delimiter, `max`, editing and validation are Ark's own props; focus,
 * invalid, disabled, read-only, a highlighted tag and an empty value surface
 * as Ark's `data-*`.
 */
export const tagsInputRecipe = cva({
  variants: {
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { size: "md" },
});

/** TagsInput's density (box height, tag height, type), shared by every part. */
export type TagsInputSize = NonNullable<VariantProps<typeof tagsInputRecipe.variants>["size"]>;
