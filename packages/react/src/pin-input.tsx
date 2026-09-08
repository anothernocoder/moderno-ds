import { PinInput as ArkPinInput } from "@ark-ui/react";
import type { PinInputRootProps } from "@ark-ui/react";
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
function PinInputRoot({ size, ...props }: ModernoPinInputRootProps) {
  return <ArkPinInput.Root {...props} {...pinInputRecipe({ size })} />;
}

/**
 * PinInput — the one-time-code control for a verify screen.
 *
 * Ark owns everything hard about a code field: focus advances as characters
 * land and retreats on backspace, a pasted string is distributed across the
 * cells (through `sanitizeValue` first, so a dash-separated code still works),
 * `type` constrains the accepted characters, `mask` swaps the cells to
 * `type="password"`, `otp` asks the platform for `autocomplete="one-time-code"`,
 * and `invalid` mirrors onto `aria-invalid` plus a `data-invalid` on every part.
 * Those Ark data-attributes — not CVA variants — are the styling hooks for the
 * filled/complete/invalid states; the recipe carries only the `size` choice.
 *
 * Only `Root` is wrapped; every other part is Ark's verbatim, and the spread
 * keeps parts Ark adds in future versions. The object is annotated so the
 * emitted `.d.ts` doesn't inline an un-nameable `@zag-js` type (TS2742).
 *
 * Composed as `Root > Label + Control(> Input × n) + HiddenInput`; each `Input`
 * takes its own `index`, and `count` on the Root tells the machine how many
 * cells exist so the server-rendered aria labels match the client's.
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
} from "@ark-ui/react";
