import { cva, type VariantProps } from "../cva.js";

/**
 * SegmentedControl: `size` on the root, matching Field's sizes (sm, md, lg),
 * which every segment follows. `fullWidth` is a boolean, which `cva` does not
 * model (it resolves string enums), so `segmentedControlAttrs` adds it beside
 * the recipe's attributes. The selected value, disabled, invalid and
 * read-only are Ark's own props and `data-*` attributes, not variants.
 */
export const segmentedControlRecipe = cva({
  variants: {
    size: ["sm", "md", "lg"],
  },
  defaultVariants: { size: "md" },
});

/** SegmentedControl's density (track height and type), matching Field's sizes. */
export type SegmentedControlSize = NonNullable<
  VariantProps<typeof segmentedControlRecipe.variants>["size"]
>;

/** What a SegmentedControl's root is styled from: the recipe's props plus `fullWidth`. */
export interface SegmentedControlAttrsProps {
  size?: SegmentedControlSize;
  /** Stretch the track to its container and share the width evenly between segments. */
  fullWidth?: boolean;
}

/**
 * The `data-*` attributes of a SegmentedControl's root: the recipe's
 * `data-size`, plus a bare `data-full-width` when `fullWidth` is on — a
 * present-or-absent attribute in all four bindings, never `"false"`.
 */
export function segmentedControlAttrs({ size, fullWidth }: SegmentedControlAttrsProps = {}): Record<
  string,
  string
> {
  const attrs = segmentedControlRecipe({ size });
  return fullWidth ? { ...attrs, "data-full-width": "" } : attrs;
}

/**
 * The part of Ark's field context a SegmentedControl reads: the id of the
 * Field's label, its state flags and the ids of its helper and error texts.
 */
export interface SegmentedControlField {
  ids: { label: string };
  disabled?: boolean;
  invalid?: boolean;
  readOnly?: boolean;
  required?: boolean;
  ariaDescribedby?: string;
}

/** The root props a Field can supply; the consumer's own values win. */
export interface SegmentedControlFieldProps {
  ids?: object;
  disabled?: boolean;
  invalid?: boolean;
  readOnly?: boolean;
  required?: boolean;
  "aria-describedby"?: string;
}

/**
 * The root props a SegmentedControl takes from the Field around it, so a
 * `Field.Label` names the group and the Field's helper or error text
 * describes it. Ark's segment group does not read the field context itself
 * (its Checkbox and RatingGroup do), so each binding hands it over here. Every
 * prop the consumer set wins; outside a Field this returns nothing.
 */
export function segmentedControlFieldProps(
  field: SegmentedControlField | undefined,
  own: Omit<SegmentedControlFieldProps, "aria-describedby"> & {
    // Svelte's element attributes allow null.
    "aria-describedby"?: string | null;
  },
): SegmentedControlFieldProps {
  if (!field) return {};
  return {
    ids: { label: field.ids.label, ...own.ids },
    disabled: own.disabled ?? field.disabled,
    invalid: own.invalid ?? field.invalid,
    readOnly: own.readOnly ?? field.readOnly,
    required: own.required ?? field.required,
    "aria-describedby": own["aria-describedby"] ?? field.ariaDescribedby,
  };
}

/** The part of an element `syncTruncationTitle` reads and writes. */
export interface TruncatableText {
  readonly scrollWidth: number;
  readonly clientWidth: number;
  readonly textContent: string | null;
  getAttribute(name: string): string | null;
  setAttribute(name: string, value: string): void;
  removeAttribute(name: string): void;
}

/**
 * Gives a segment's text a `title` tooltip with its full label while the
 * label is cut off by an ellipsis, and takes that tooltip away once it fits.
 * Each binding calls it when the pointer enters the text, the moment the
 * browser is about to show a tooltip. A `title` the consumer set to anything
 * else is left alone.
 */
export function syncTruncationTitle(text: TruncatableText): void {
  const label = text.textContent?.trim() ?? "";
  if (text.scrollWidth > text.clientWidth) {
    text.setAttribute("title", label);
  } else if (text.getAttribute("title") === label) {
    text.removeAttribute("title");
  }
}
