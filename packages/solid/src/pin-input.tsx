import { splitProps } from "solid-js";
import { PinInput as ArkPinInput } from "@ark-ui/solid";
import type { PinInputRootProps } from "@ark-ui/solid";
import { pinInputRecipe, type PinInputSize } from "@moderno-ui/core";

export type { PinInputSize } from "@moderno-ui/core";

export type ModernoPinInputRootProps = PinInputRootProps & {
  size?: PinInputSize;
};

/**
 * PinInput.Root with the Moderno `size` recipe folded in. Ark's Root spreads
 * unknown props onto its `data-part="root"` element, so the recipe's `data-size`
 * rides along and `components.css` keys the cell density off it.
 */
function PinInputRoot(props: ModernoPinInputRootProps) {
  const [local, rest] = splitProps(props, ["size"]);
  return <ArkPinInput.Root {...rest} {...pinInputRecipe({ size: local.size })} />;
}

/**
 * PinInput — the one-time-code control for a verify screen (Ark drives focus
 * movement, paste distribution, masking and the invalid/complete flags). Only
 * `Root` is wrapped to inject the `size` recipe; every other part is Ark's
 * verbatim, styled by `components.css` keyed on Ark's `data-part` plus
 * `data-filled`/`data-complete`/`data-invalid`. The object is annotated so the
 * emitted `.d.ts` doesn't inline an un-nameable `@zag-js` type (TS2742).
 */
export const PinInput: Omit<typeof ArkPinInput, "Root"> & { Root: typeof PinInputRoot } = {
  ...ArkPinInput,
  Root: PinInputRoot,
};

export type {
  PinInputRootProps,
  PinInputLabelProps,
  PinInputControlProps,
  PinInputInputProps,
  PinInputHiddenInputProps,
  PinInputValueChangeDetails,
  PinInputValueInvalidDetails,
} from "@ark-ui/solid";
