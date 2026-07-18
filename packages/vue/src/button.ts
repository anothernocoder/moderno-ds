import { defineComponent, h, type PropType } from "vue";
import { buttonRecipe, partAttrs, type ButtonSize, type ButtonVariant } from "@moderno/core";

type ButtonType = "button" | "submit" | "reset";

/**
 * Button — the reference primitive, ported to Vue.
 *
 * Identical contract to `@moderno/react`: a plain `<button>` carrying
 * `data-scope`/`data-part` plus the shared `buttonRecipe`'s `data-variant`/
 * `data-size`. Zero styling lives here — `components.css` paints it from token
 * slots, so the same brand re-themes Vue and React alike.
 *
 * `inheritAttrs: false` so consumer attributes (class, onClick, aria-*) are
 * spread explicitly *before* the scope/part/variant attrs — the contract attrs
 * land last and can't be clobbered, mirroring the React binding's prop order.
 */
export const Button = defineComponent({
  name: "ModernoButton",
  inheritAttrs: false,
  props: {
    variant: { type: String as PropType<ButtonVariant>, default: undefined },
    size: { type: String as PropType<ButtonSize>, default: undefined },
    type: { type: String as PropType<ButtonType>, default: undefined },
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "button",
        {
          type: props.type ?? "button",
          ...attrs,
          ...partAttrs("button", "root"),
          ...buttonRecipe({ variant: props.variant, size: props.size }),
        },
        slots.default?.(),
      );
  },
});

export type { ButtonVariant, ButtonSize } from "@moderno/core";
