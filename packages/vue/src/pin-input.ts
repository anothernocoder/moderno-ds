import { defineComponent, h, type Component, type DefineComponent, type PropType } from "vue";
import { PinInput as ArkPinInput } from "@ark-ui/vue";
import type {
  PinInputRootProps,
  PinInputValueChangeDetails,
  PinInputValueInvalidDetails,
} from "@ark-ui/vue";
import { pinInputRecipe, type PinInputSize } from "@moderno-ui/core";

export type { PinInputSize } from "@moderno-ui/core";

/**
 * The Root's public surface: Ark's own props plus the Moderno `size` recipe.
 * Ark-Vue declares the value callbacks as emits rather than props, so they are
 * spelled out here — a `h()` caller (and a template) passes them as `onX`
 * handlers, and `inheritAttrs: false` forwards them untouched to Ark's Root.
 */
export interface ModernoPinInputRootProps extends PinInputRootProps {
  size?: PinInputSize;
  onValueChange?: (details: PinInputValueChangeDetails) => void;
  onValueComplete?: (details: PinInputValueChangeDetails) => void;
  onValueInvalid?: (details: PinInputValueInvalidDetails) => void;
}

/**
 * PinInput.Root with the Moderno `size` recipe folded in. Ark's Root spreads
 * unknown attributes onto its `data-part="root"` element, so the recipe's
 * `data-size` rides along and `components.css` keys the cell density off it.
 */
const PinInputRootImpl = defineComponent({
  name: "ModernoPinInputRoot",
  inheritAttrs: false,
  props: {
    size: { type: String as PropType<PinInputSize>, default: undefined },
  },
  setup(props, { slots, attrs }) {
    // Forward all consumer props/handlers (count, mask, onValueComplete, …) via
    // attrs; Ark's Root re-typed as a plain Component so the merged bag isn't
    // checked against its full prop union (we only add data-size).
    const Root = ArkPinInput.Root as unknown as Component;
    return () => h(Root, { ...attrs, ...pinInputRecipe({ size: props.size }) }, slots);
  },
});

/**
 * PinInput — the one-time-code control for a verify screen (Ark drives focus
 * movement, paste distribution, masking and the invalid/complete flags). Only
 * `Root` is wrapped to inject the `size` recipe; every other part is Ark's
 * verbatim, styled by `components.css` keyed on Ark's `data-part` plus
 * `data-filled`/`data-complete`/`data-invalid`.
 *
 * The whole object is annotated explicitly so the emitted `.d.ts` doesn't
 * inline an un-nameable type that points at internal `@zag-js` paths (TS2742).
 */
export const PinInput: Omit<typeof ArkPinInput, "Root"> & {
  Root: DefineComponent<ModernoPinInputRootProps>;
} = {
  ...ArkPinInput,
  Root: PinInputRootImpl as unknown as DefineComponent<ModernoPinInputRootProps>,
};

export type {
  PinInputRootProps,
  PinInputLabelProps,
  PinInputControlProps,
  PinInputInputProps,
  PinInputHiddenInputProps,
  PinInputValueChangeDetails,
  PinInputValueInvalidDetails,
} from "@ark-ui/vue";
