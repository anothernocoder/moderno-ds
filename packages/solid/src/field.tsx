import { splitProps } from "solid-js";
import { Field as ArkField } from "@ark-ui/solid";
import type { FieldRootProps } from "@ark-ui/solid";
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
function FieldRoot(props: ModernoFieldRootProps) {
  const [local, rest] = splitProps(props, ["size"]);
  return <ArkField.Root {...rest} {...fieldRecipe({ size: local.size })} />;
}

/**
 * Field — form control + accessibility (Ark drives all of it).
 *
 * Ark's Field machine wires `label[for]` ↔ control `id`, mirrors
 * `aria-invalid`/`aria-describedby`, and emits `data-invalid`/`data-disabled`/
 * `data-required` on every part. Those Ark attributes are the styling hooks for
 * *state*; the only prop-driven knob is `size`, so `Root` is the single wrapped
 * part and every other part is Ark's verbatim, dressed by `components.css`
 * identically to React.
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
} from "@ark-ui/solid";
