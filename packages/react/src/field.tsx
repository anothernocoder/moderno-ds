import { Field as ArkField } from "@ark-ui/react";
import type { FieldRootProps } from "@ark-ui/react";
import { fieldRecipe, type FieldSize } from "@moderno-ui/core";

export type { FieldSize } from "@moderno-ui/core";

export type ModernoFieldRootProps = FieldRootProps & {
  /** Density of the whole field: label, control and helper/error text. */
  size?: FieldSize;
};

/**
 * Field.Root with the Moderno `size` recipe folded in. Ark's Root spreads
 * unknown props onto its `data-part="root"` element, so the recipe's `data-size`
 * rides along and `components.css` sizes every part from that one attribute.
 */
function FieldRoot({ size, ...props }: ModernoFieldRootProps) {
  return <ArkField.Root {...props} {...fieldRecipe({ size })} />;
}

/**
 * Field — form control + accessibility.
 *
 * Ark's Field machine owns the hard parts: it wires `label[for]` ↔ control `id`,
 * mirrors `aria-invalid`/`aria-describedby`, and exposes `data-invalid` /
 * `data-disabled` / `data-required` on every part. Those Ark data-attributes are
 * the styling hooks for *state*; the only prop-driven knob is `size`, so `Root`
 * is the single wrapped part and every other part is Ark's verbatim — Input,
 * Textarea, Label, HelperText and ErrorText all render straight from the
 * machine and are dressed by `components.css`.
 */
export const Field: Omit<typeof ArkField, "Root"> & { Root: typeof FieldRoot } = {
  ...ArkField,
  Root: FieldRoot,
};

export type {
  FieldRootProps,
  FieldLabelProps,
  FieldInputProps,
  FieldTextareaProps,
  FieldHelperTextProps,
  FieldErrorTextProps,
} from "@ark-ui/react";
