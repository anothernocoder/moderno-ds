import { splitProps } from "solid-js";
import { Switch as ArkSwitch } from "@ark-ui/solid";
import type { SwitchHiddenInputProps, SwitchRootProps } from "@ark-ui/solid";
import { switchRecipe, type SwitchSize } from "@moderno-ui/core";

export type { SwitchSize } from "@moderno-ui/core";

export type ModernoSwitchRootProps = SwitchRootProps & {
  /** Control density — resolves to `data-size` on the root part. */
  size?: SwitchSize;
};

/**
 * Switch.Root with the Moderno `size` recipe folded in. Ark's Root spreads
 * unknown props onto its `data-part="root"` element, so the recipe's
 * `data-size` rides along and `components.css` keys the track, thumb and label
 * density off it.
 */
function SwitchRoot(props: ModernoSwitchRootProps) {
  const [local, rest] = splitProps(props, ["size"]);
  return <ArkSwitch.Root {...rest} {...switchRecipe({ size: local.size })} />;
}

/**
 * Switch.HiddenInput with `role="switch"`. Ark renders a plain checkbox input,
 * which a screen reader would announce as a checkbox; the role makes it say
 * "switch, on/off" instead. A consumer `role` still wins; `undefined` keeps the
 * default.
 */
function SwitchHiddenInput(props: SwitchHiddenInputProps) {
  return <ArkSwitch.HiddenInput {...props} role={props.role ?? "switch"} />;
}

/**
 * Switch — an on/off control with a label, for a setting that applies at once;
 * Ark drives all of it. The root is a `<label>` bound to a visually hidden
 * native `<input type="checkbox">`, and every part carries
 * `data-state="checked|unchecked"` plus `data-disabled`/`data-invalid`/
 * `data-readonly` — Ark attributes, not CVA variants, are the styling hooks.
 * `Root` is wrapped to inject the `size` recipe and `HiddenInput` to add its
 * switch role; every other part is Ark's verbatim. The object is annotated so
 * the emitted `.d.ts` doesn't inline an un-nameable `@zag-js` type (TS2742).
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
} from "@ark-ui/solid";
