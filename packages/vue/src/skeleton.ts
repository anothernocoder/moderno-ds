import { defineComponent, h, type PropType } from "vue";
import { partAttrs, skeletonRecipe, type SkeletonShape } from "@moderno-ui/core";

/**
 * Skeleton — a muted placeholder shown where content is still loading, ported
 * to Vue.
 *
 * Identical contract to `@moderno-ui/react`: an empty `<span>` carrying
 * `data-scope`/`data-part` plus the shared `skeletonRecipe`'s `data-shape`,
 * painted as a block by `components.css`. It is `aria-hidden` (a consumer
 * attr can override it); mark the loading region with `aria-busy` instead.
 *
 * `inheritAttrs: false` so consumer attributes spread explicitly *before* the
 * scope/part/shape attrs — the contract attrs land last and can't be
 * clobbered, mirroring the React binding's prop order.
 */
export const Skeleton = defineComponent({
  name: "ModernoSkeleton",
  inheritAttrs: false,
  props: {
    shape: { type: String as PropType<SkeletonShape>, default: undefined },
  },
  setup(props, { attrs }) {
    return () =>
      h("span", {
        "aria-hidden": "true",
        ...attrs,
        ...partAttrs("skeleton", "root"),
        ...skeletonRecipe({ shape: props.shape }),
      });
  },
});

export type { SkeletonShape } from "@moderno-ui/core";
