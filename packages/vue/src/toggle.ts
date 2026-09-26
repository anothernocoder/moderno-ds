import { defineComponent, h, type Component, type DefineComponent, type PropType } from "vue";
import { Toggle as ArkToggle } from "@ark-ui/vue";
import type { ToggleRootProps } from "@ark-ui/vue";
import { toggleRecipe, type ToggleSize, type ToggleVariant } from "@moderno-ui/core";

export type { ToggleSize, ToggleVariant } from "@moderno-ui/core";

/**
 * The Root's public surface: Ark's own props plus the Moderno `variant` ×
 * `size` recipe. Ark-Vue declares the change callbacks as emits rather than
 * props, so they are spelled out here — a `h()` caller (and a template)
 * passes them as `onPressedChange` / `onUpdate:pressed` handlers, and
 * `inheritAttrs: false` forwards them untouched.
 */
export interface ModernoToggleRootProps extends ToggleRootProps {
  variant?: ToggleVariant;
  size?: ToggleSize;
  onPressedChange?: (pressed: boolean) => void;
  "onUpdate:pressed"?: (pressed: boolean) => void;
}

/**
 * Toggle.Root with the Moderno `variant` × `size` recipe folded in. Ark's
 * Root spreads unknown attributes onto its `<button data-part="root">`, so
 * the recipe's `data-variant`/`data-size` ride along for `components.css`.
 * `pressed`, `onPressedChange`, `disabled`, … pass straight through via attrs.
 */
const ToggleRootImpl = defineComponent({
  name: "ModernoToggleRoot",
  inheritAttrs: false,
  props: {
    variant: { type: String as PropType<ToggleVariant>, default: undefined },
    size: { type: String as PropType<ToggleSize>, default: undefined },
  },
  setup(props, { slots, attrs }) {
    // Ark's Root re-typed as a plain Component so the merged bag isn't checked
    // against its full prop union (we only add the recipe's data-*).
    const Root = ArkToggle.Root as unknown as Component;
    return () =>
      h(Root, { ...attrs, ...toggleRecipe({ variant: props.variant, size: props.size }) }, slots);
  },
});

/**
 * Toggle — a button that stays pressed until it is pressed again; Ark drives
 * all of it. The root is a native `<button>` with `aria-pressed`,
 * `data-state="on|off"`, `data-pressed` and `data-disabled`, and the optional
 * `Indicator` shows its default slot while on and its `fallback` while off.
 * Ark attributes, not CVA variants, carry the state. `Root` is wrapped to
 * inject the recipe; every other part is Ark's verbatim.
 *
 * The whole object is annotated explicitly so the emitted `.d.ts` doesn't
 * inline an un-nameable type that points at internal `@zag-js` paths (TS2742).
 */
export const Toggle: Omit<typeof ArkToggle, "Root"> & {
  Root: DefineComponent<ModernoToggleRootProps>;
} = {
  ...ArkToggle,
  Root: ToggleRootImpl as unknown as DefineComponent<ModernoToggleRootProps>,
};

export type { ToggleRootProps, ToggleIndicatorProps } from "@ark-ui/vue";
