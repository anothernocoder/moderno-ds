import { defineComponent, h, type Component, type DefineComponent, type PropType } from "vue";
import { Progress as ArkProgress } from "@ark-ui/vue";
import type { ProgressRootProps, ProgressValueChangeDetails } from "@ark-ui/vue";
import { progressRecipe, type ProgressSize } from "@moderno-ui/core";

export type { ProgressSize } from "@moderno-ui/core";

/**
 * The Root's public surface: Ark's own props plus the Moderno `size` recipe.
 * Ark-Vue declares the change callbacks as emits rather than props, so they
 * are spelled out here — a `h()` caller (and a template) passes them as
 * `onValueChange` / `onUpdate:modelValue` handlers, and `inheritAttrs: false`
 * forwards them untouched.
 */
export interface ModernoProgressRootProps extends ProgressRootProps {
  size?: ProgressSize;
  onValueChange?: (details: ProgressValueChangeDetails) => void;
  "onUpdate:modelValue"?: (value: number | null) => void;
}

/**
 * Progress.Root with the Moderno `size` recipe folded in. Ark's Root spreads
 * unknown attributes onto its `data-part="root"` element, so the recipe's
 * attribute rides along and `components.css` sizes the parts from it.
 * `defaultValue`, `modelValue`, `min`, `max`, `orientation`, … pass straight
 * through via attrs.
 */
const ProgressRootImpl = defineComponent({
  name: "ModernoProgressRoot",
  inheritAttrs: false,
  props: {
    size: { type: String as PropType<ProgressSize>, default: undefined },
  },
  setup(props, { slots, attrs }) {
    // Ark's Root re-typed as a plain Component so the merged bag isn't checked
    // against its full prop union (we only add the recipe's data-*).
    const Root = ArkProgress.Root as unknown as Component;
    return () => h(Root, { ...attrs, ...progressRecipe({ size: props.size }) }, slots);
  },
});

/**
 * Progress — how far a task has come, as a bar or a ring. Ark drives all of
 * it: the `Track` (linear) or the `Circle` (circular) is the
 * `role="progressbar"` with `aria-valuenow`, `aria-valuemin` and
 * `aria-valuemax`, every part carries `data-state` (`loading`, `complete`, or
 * `indeterminate` when the value is `null`), the `Range` and `CircleRange`
 * show the percentage, `ValueText` prints it and `View` shows its children
 * in one state only. `Root` is wrapped to inject the recipe; every other part
 * is Ark's verbatim.
 *
 * The whole object is annotated explicitly so the emitted `.d.ts` doesn't
 * inline an un-nameable type that points at internal `@zag-js` paths (TS2742).
 */
export const Progress: Omit<typeof ArkProgress, "Root"> & {
  Root: DefineComponent<ModernoProgressRootProps>;
} = {
  ...ArkProgress,
  Root: ProgressRootImpl as unknown as DefineComponent<ModernoProgressRootProps>,
};

export type {
  ProgressRootProps,
  ProgressLabelProps,
  ProgressTrackProps,
  ProgressRangeProps,
  ProgressValueTextProps,
  ProgressCircleProps,
  ProgressCircleTrackProps,
  ProgressCircleRangeProps,
  ProgressViewProps,
  ProgressValueChangeDetails,
} from "@ark-ui/vue";
