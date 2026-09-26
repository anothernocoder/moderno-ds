import { Progress as ArkProgress } from "@ark-ui/react";
import type { ProgressRootProps } from "@ark-ui/react";
import { progressRecipe, type ProgressSize } from "@moderno-ui/core";

export type { ProgressSize } from "@moderno-ui/core";

export interface ModernoProgressRootProps extends ProgressRootProps {
  /** Track thickness, circle size and type — resolves to `data-size` on the root part. */
  size?: ProgressSize;
}

/**
 * Progress.Root with the Moderno `size` recipe folded in. Ark's Root spreads
 * unknown props onto its `data-part="root"` element, so the recipe's
 * attribute rides along and `components.css` sizes the parts from it.
 */
function ProgressRoot({ size, ...props }: ModernoProgressRootProps) {
  return <ArkProgress.Root {...props} {...progressRecipe({ size })} />;
}

/**
 * Progress — how far a task has come, as a bar or a ring.
 *
 * Ark drives the machine: the `Track` (linear) or the `Circle` (circular) is
 * the `role="progressbar"` with `aria-valuenow`, `aria-valuemin` and
 * `aria-valuemax`, and every part carries `data-state` (`loading`,
 * `complete`, or `indeterminate` when `value` is `null`). The `Range` and
 * `CircleRange` show the percentage Ark computes; `ValueText` prints it;
 * `View` shows its children only in one state. The recipe only adds the
 * `size` a consumer picks. Anatomy: `Root > Label + ValueText + Track > Range`,
 * or `Root > Label + Circle > (CircleTrack, CircleRange) + ValueText`. `Root`
 * is wrapped for the recipe; every other part is Ark's verbatim. The object is
 * annotated so the emitted `.d.ts` doesn't inline an un-nameable `@zag-js`
 * type (TS2742).
 */
export const Progress: Omit<typeof ArkProgress, "Root"> & { Root: typeof ProgressRoot } = {
  ...ArkProgress,
  Root: ProgressRoot,
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
} from "@ark-ui/react";
