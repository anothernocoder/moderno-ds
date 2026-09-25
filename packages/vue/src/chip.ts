import { defineComponent, h, type PropType } from "vue";
import { chipRecipe, partAttrs, type ChipSize, type ChipVariant } from "@moderno-ui/core";

/**
 * Chip — a compact, optionally removable token, ported to Vue.
 *
 * Identical contract to `@moderno-ui/react`: a `<span>` root carrying
 * `data-scope`/`data-part` plus the shared `chipRecipe`'s
 * `data-variant`/`data-size`, the default slot inside the `label` part, and —
 * when `removable` — a native `<button>` as the `remove-trigger` part. The
 * press is reported as a `remove` event; removing the chip is the consumer's
 * job.
 *
 * `inheritAttrs: false` so consumer attributes spread explicitly *before* the
 * scope/part/variant attrs — the contract attrs land last and can't be
 * clobbered.
 */
export const Chip = defineComponent({
  name: "ModernoChip",
  inheritAttrs: false,
  props: {
    variant: { type: String as PropType<ChipVariant>, default: undefined },
    size: { type: String as PropType<ChipSize>, default: undefined },
    removable: { type: Boolean, default: false },
    removeLabel: { type: String, default: "Remove" },
  },
  emits: ["remove"],
  setup(props, { slots, attrs, emit }) {
    return () =>
      h(
        "span",
        {
          ...attrs,
          ...partAttrs("chip", "root"),
          ...chipRecipe({ variant: props.variant, size: props.size }),
        },
        [
          h("span", { ...partAttrs("chip", "label") }, slots.default?.()),
          props.removable
            ? h(
                "button",
                {
                  type: "button",
                  "aria-label": props.removeLabel,
                  onClick: () => emit("remove"),
                  ...partAttrs("chip", "remove-trigger"),
                },
                [h("span", { "aria-hidden": "true" }, "×")],
              )
            : null,
        ],
      );
  },
});

export type { ChipVariant, ChipSize } from "@moderno-ui/core";
