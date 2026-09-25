import { defineComponent, h, type PropType } from "vue";
import {
  indicatorAttrs,
  partAttrs,
  type IndicatorSize,
  type IndicatorVariant,
} from "@moderno-ui/core";

/**
 * Indicator — a small status dot with an optional label and pulse, ported to
 * Vue.
 *
 * Identical contract to `@moderno-ui/react`: a `<span>` root carrying
 * `data-scope`/`data-part` plus the shared `indicatorAttrs` (`data-variant`,
 * `data-size`, and a bare `data-pulse` when `pulse` is on). The dot is always
 * rendered and hidden from assistive tech; the default slot becomes the
 * `label` part.
 *
 * `inheritAttrs: false` so consumer attributes spread explicitly *before* the
 * scope/part/variant attrs — the contract attrs land last and can't be
 * clobbered.
 */
export const Indicator = defineComponent({
  name: "ModernoIndicator",
  inheritAttrs: false,
  props: {
    variant: { type: String as PropType<IndicatorVariant>, default: undefined },
    size: { type: String as PropType<IndicatorSize>, default: undefined },
    pulse: { type: Boolean, default: false },
  },
  setup(props, { slots, attrs }) {
    return () => {
      const label = slots.default?.();
      const hasLabel = label !== undefined && label.length > 0;
      return h(
        "span",
        {
          ...attrs,
          ...partAttrs("indicator", "root"),
          ...indicatorAttrs({ variant: props.variant, size: props.size, pulse: props.pulse }),
        },
        [
          h("span", { "aria-hidden": "true", ...partAttrs("indicator", "dot") }),
          hasLabel ? h("span", { ...partAttrs("indicator", "label") }, label) : null,
        ],
      );
    };
  },
});

export type { IndicatorVariant, IndicatorSize } from "@moderno-ui/core";
