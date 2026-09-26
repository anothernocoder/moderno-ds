import { defineComponent, h, type PropType } from "vue";
import { badgeRecipe, partAttrs, type BadgeSize, type BadgeVariant } from "@moderno-ui/core";

/**
 * Badge — a short, static label for a status or a count, ported to Vue.
 *
 * Identical contract to `@moderno-ui/react`: a `<span>` carrying
 * `data-scope`/`data-part` plus the shared `badgeRecipe`'s
 * `data-variant`/`data-size`, painted entirely by `components.css`. `dot`
 * adds the `dot` part, hidden from assistive tech.
 *
 * `inheritAttrs: false` so consumer attributes spread explicitly *before* the
 * scope/part/variant attrs — the contract attrs land last and can't be
 * clobbered, mirroring the React binding's prop order.
 */
export const Badge = defineComponent({
  name: "ModernoBadge",
  inheritAttrs: false,
  props: {
    variant: { type: String as PropType<BadgeVariant>, default: undefined },
    size: { type: String as PropType<BadgeSize>, default: undefined },
    dot: { type: Boolean, default: false },
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "span",
        {
          ...attrs,
          ...partAttrs("badge", "root"),
          ...badgeRecipe({ variant: props.variant, size: props.size }),
        },
        [
          props.dot ? h("span", { "aria-hidden": "true", ...partAttrs("badge", "dot") }) : null,
          slots.default?.(),
        ],
      );
  },
});

export type { BadgeVariant, BadgeSize } from "@moderno-ui/core";
