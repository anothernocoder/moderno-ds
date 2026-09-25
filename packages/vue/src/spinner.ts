import { defineComponent, h, type PropType } from "vue";
import { partAttrs, spinnerRecipe, type SpinnerSize } from "@moderno-ui/core";

/**
 * Spinner — a spinning ring that says "something is loading" without a
 * progress value, ported to Vue.
 *
 * Identical contract to `@moderno-ui/react`: a `<span role="status">` root
 * carrying `data-scope`/`data-part` plus the shared `spinnerRecipe`'s
 * `data-size`. The `circle` part is the ring, hidden from assistive tech; the
 * `label` part is visually hidden text read by screen readers ("Loading", or
 * `label`).
 *
 * `inheritAttrs: false` so consumer attributes spread explicitly *before* the
 * scope/part/size attrs — the contract attrs land last and can't be
 * clobbered.
 */
export const Spinner = defineComponent({
  name: "ModernoSpinner",
  inheritAttrs: false,
  props: {
    size: { type: String as PropType<SpinnerSize>, default: undefined },
    label: { type: String, default: "Loading" },
  },
  setup(props, { attrs }) {
    return () =>
      h(
        "span",
        {
          role: "status",
          ...attrs,
          ...partAttrs("spinner", "root"),
          ...spinnerRecipe({ size: props.size }),
        },
        [
          h("span", { "aria-hidden": "true", ...partAttrs("spinner", "circle") }),
          h("span", { ...partAttrs("spinner", "label") }, props.label),
        ],
      );
  },
});

export type { SpinnerSize } from "@moderno-ui/core";
