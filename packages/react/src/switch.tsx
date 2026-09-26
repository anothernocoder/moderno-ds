import { Switch as ArkSwitch } from "@ark-ui/react";
import type { SwitchHiddenInputProps, SwitchRootProps } from "@ark-ui/react";
import { switchRecipe, type SwitchSize } from "@moderno-ui/core";

export type { SwitchSize } from "@moderno-ui/core";

export interface ModernoSwitchRootProps extends SwitchRootProps {
  /** Control density — resolves to `data-size` on the root part. */
  size?: SwitchSize;
}

/**
 * Switch.Root with the Moderno `size` recipe folded in. Ark's Root spreads
 * unknown props onto its `data-part="root"` element, so the recipe's
 * `data-size` rides along and `components.css` keys the track, thumb and label
 * density off it.
 */
function SwitchRoot({ size, ...props }: ModernoSwitchRootProps) {
  return <ArkSwitch.Root {...props} {...switchRecipe({ size })} />;
}

/**
 * Switch.HiddenInput with `role="switch"`. Ark renders a plain checkbox input,
 * which a screen reader would announce as a checkbox; the role makes it say
 * "switch, on/off" instead. A consumer `role` still wins; `undefined` keeps the
 * default.
 */
function SwitchHiddenInput({ role = "switch", ...props }: SwitchHiddenInputProps) {
  return <ArkSwitch.HiddenInput {...props} role={role} />;
}

/**
 * Switch — an on/off control with a label, for a setting that applies at once.
 *
 * Ark drives the machine: the root is a `<label>` bound to a visually hidden
 * native `<input type="checkbox">` (so forms, `name`/`value` and focus work),
 * and every part carries `data-state="checked|unchecked"` plus
 * `data-disabled`/`data-invalid`/`data-readonly`. Those Ark attributes — not
 * CVA variants — are the styling hooks; the recipe only adds the `size` a
 * consumer picks. Anatomy: `Root > Control > Thumb` + `Label` + `HiddenInput`.
 * `Root` is wrapped for the recipe and `HiddenInput` for its switch role; every
 * other part is Ark's verbatim, so parts Ark adds later ride along through the
 * spread. The object is annotated so the emitted `.d.ts` doesn't inline an
 * un-nameable `@zag-js` type (TS2742).
 */
export const Switch: Omit<typeof ArkSwitch, "Root" | "HiddenInput"> & {
  Root: typeof SwitchRoot;
  HiddenInput: typeof SwitchHiddenInput;
} = {
  ...ArkSwitch,
  Root: SwitchRoot,
  HiddenInput: SwitchHiddenInput,
};

export type {
  SwitchRootProps,
  SwitchControlProps,
  SwitchThumbProps,
  SwitchLabelProps,
  SwitchHiddenInputProps,
  SwitchCheckedChangeDetails,
} from "@ark-ui/react";
