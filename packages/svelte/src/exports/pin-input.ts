import { PinInput as ArkPinInput } from "@ark-ui/svelte";
import PinInputRoot from "../PinInputRoot.svelte";

/**
 * PinInput — the one-time-code control for a verify screen. Ark drives focus
 * movement, paste distribution, masking and the invalid/complete flags; only
 * `Root` is wrapped (to inject the `size` recipe), every other part is Ark's
 * verbatim. Annotated so the emitted `.d.ts` doesn't inline an un-nameable
 * `@zag-js` type (TS2742).
 */
export const PinInput: Omit<typeof ArkPinInput, "Root"> & { Root: typeof PinInputRoot } = {
  ...ArkPinInput,
  Root: PinInputRoot,
};
export type { PinInputValueChangeDetails, PinInputValueInvalidDetails } from "@ark-ui/svelte";
