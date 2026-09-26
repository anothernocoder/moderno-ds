import { defineComponent, h, type Component, type DefineComponent, type PropType } from "vue";
import { Switch as ArkSwitch } from "@ark-ui/vue";
import type {
  SwitchCheckedChangeDetails,
  SwitchHiddenInputProps,
  SwitchRootProps,
} from "@ark-ui/vue";
import { switchRecipe, type SwitchSize } from "@moderno-ui/core";

export type { SwitchSize } from "@moderno-ui/core";

/**
 * The Root's public surface: Ark's own props plus the Moderno `size` recipe.
 * Ark-Vue declares the change callbacks as emits rather than props, so they
 * are spelled out here — a `h()` caller (and a template) passes them as
 * `onCheckedChange` / `onUpdate:checked` handlers, and `inheritAttrs: false`
 * forwards them untouched.
 */
export interface ModernoSwitchRootProps extends SwitchRootProps {
  size?: SwitchSize;
  onCheckedChange?: (details: SwitchCheckedChangeDetails) => void;
  "onUpdate:checked"?: (checked: boolean) => void;
}

/**
 * Switch.Root with the Moderno `size` recipe folded in. Ark's Root spreads
 * unknown attributes onto its `data-part="root"` element, so the recipe's
 * `data-size` rides along and `components.css` keys the track, thumb and label
 * density off it. `checked`, `onCheckedChange`, `name`, … pass straight
 * through via attrs.
 */
const SwitchRootImpl = defineComponent({
  name: "ModernoSwitchRoot",
  inheritAttrs: false,
  props: {
    size: { type: String as PropType<SwitchSize>, default: undefined },
  },
  setup(props, { slots, attrs }) {
    // Ark's Root re-typed as a plain Component so the merged bag isn't checked
    // against its full prop union (we only add data-size).
    const Root = ArkSwitch.Root as unknown as Component;
    return () => h(Root, { ...attrs, ...switchRecipe({ size: props.size }) }, slots);
  },
});

/**
 * Switch.HiddenInput with `role="switch"`. Ark renders a plain checkbox input,
 * which a screen reader would announce as a checkbox; the role makes it say
 * "switch, on/off" instead. A consumer `role` still wins; `undefined` keeps the
 * default.
 */
const SwitchHiddenInputImpl = defineComponent({
  name: "ModernoSwitchHiddenInput",
  inheritAttrs: false,
  setup(_, { attrs }) {
    const HiddenInput = ArkSwitch.HiddenInput as unknown as Component;
    return () => h(HiddenInput, { ...attrs, role: attrs.role ?? "switch" });
  },
});

/**
 * Switch — an on/off control with a label, for a setting that applies at once;
 * Ark drives all of it. The root is a `<label>` bound to a visually hidden
 * native `<input type="checkbox">`, and every part carries
 * `data-state="checked|unchecked"` plus `data-disabled`/`data-invalid`/
 * `data-readonly` — Ark attributes, not CVA variants, are the styling hooks.
 * `Root` is wrapped to inject the `size` recipe and `HiddenInput` to add its
 * switch role; every other part is Ark's verbatim.
 *
 * The whole object is annotated explicitly so the emitted `.d.ts` doesn't
 * inline an un-nameable type that points at internal `@zag-js` paths (TS2742).
 */
export const Switch: Omit<typeof ArkSwitch, "Root" | "HiddenInput"> & {
  Root: DefineComponent<ModernoSwitchRootProps>;
  HiddenInput: DefineComponent<SwitchHiddenInputProps>;
} = {
  ...ArkSwitch,
  Root: SwitchRootImpl as unknown as DefineComponent<ModernoSwitchRootProps>,
  HiddenInput: SwitchHiddenInputImpl as unknown as DefineComponent<SwitchHiddenInputProps>,
};

export type {
  SwitchRootProps,
  SwitchControlProps,
  SwitchThumbProps,
  SwitchLabelProps,
  SwitchHiddenInputProps,
  SwitchCheckedChangeDetails,
} from "@ark-ui/vue";
