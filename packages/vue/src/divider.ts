import { defineComponent, h, type PropType } from "vue";
import {
  dividerRecipe,
  partAttrs,
  type DividerAlign,
  type DividerOrientation,
} from "@moderno-ui/core";

/**
 * Divider — the rule primitive, ported to Vue.
 *
 * Identical contract to `@moderno-ui/react`: a plain element carrying
 * `data-scope`/`data-part` plus the shared `dividerRecipe`'s
 * `data-orientation`/`data-align`, with the stroke drawn by `components.css`
 * from `--border`. The default slot is the optional label.
 *
 * `inheritAttrs: false` so consumer attributes spread explicitly *before* the
 * scope/part/variant attrs — the contract attrs land last and can't be
 * clobbered, mirroring the React binding's prop order. `role`/`aria-orientation`
 * are computed first, so a consumer can still override them.
 */
export const Divider = defineComponent({
  name: "ModernoDivider",
  inheritAttrs: false,
  props: {
    orientation: { type: String as PropType<DividerOrientation>, default: undefined },
    align: { type: String as PropType<DividerAlign>, default: undefined },
  },
  setup(props, { slots, attrs }) {
    return () => {
      const label = slots.default?.();
      const hasLabel = label !== undefined && label.length > 0;
      return h(
        "div",
        {
          role: hasLabel ? undefined : "separator",
          "aria-orientation": hasLabel ? undefined : (props.orientation ?? "horizontal"),
          ...attrs,
          ...partAttrs("divider", "root"),
          ...dividerRecipe({ orientation: props.orientation, align: props.align }),
        },
        hasLabel ? [h("span", { ...partAttrs("divider", "label") }, label)] : [],
      );
    };
  },
});

export type { DividerAlign, DividerOrientation } from "@moderno-ui/core";
