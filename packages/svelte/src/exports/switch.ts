import { Switch as ArkSwitch } from "@ark-ui/svelte";
import SwitchRoot from "../SwitchRoot.svelte";
import SwitchHiddenInput from "../SwitchHiddenInput.svelte";

/**
 * Switch — an on/off control with a label, for a setting that applies at once.
 * Ark binds the root `<label>` to a visually hidden native input and stamps
 * `data-state` / `data-disabled` / `data-invalid` on every part. `Root` is
 * wrapped to inject the `size` recipe and `HiddenInput` to add its switch
 * role; every other part is Ark's verbatim. Annotated so the emitted `.d.ts`
 * doesn't inline an un-nameable `@zag-js` type (TS2742).
 */
export const Switch: Omit<typeof ArkSwitch, "Root" | "HiddenInput"> & {
  Root: typeof SwitchRoot;
  HiddenInput: typeof SwitchHiddenInput;
} = {
  ...ArkSwitch,
  Root: SwitchRoot,
  HiddenInput: SwitchHiddenInput,
};
export type { SwitchSize } from "@moderno-ui/core";
export type { SwitchCheckedChangeDetails } from "@ark-ui/svelte";
