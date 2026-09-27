import { cva, type VariantProps } from "../cva.js";

/**
 * DatePicker: `size` — the height of the input box, the size of each day in
 * the calendar and the type of both. The value, `selectionMode` (single,
 * multiple, range), `locale`, `min`/`max` and the open state are Ark's own
 * props; selected, today, in-range, disabled and open surface as Ark's
 * `data-*`. The calendar usually sits in a Portal, outside the root, so the
 * size is set on `DatePicker.Root` and lands on the root and on the content.
 */
export const datePickerRecipe = cva({
  variants: {
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { size: "md" },
});

/** DatePicker's density (box height, day size, type), shared by the input and the calendar. */
export type DatePickerSize = NonNullable<VariantProps<typeof datePickerRecipe.variants>["size"]>;
