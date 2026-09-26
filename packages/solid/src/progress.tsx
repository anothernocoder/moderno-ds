import { splitProps } from "solid-js";
import { Progress as ArkProgress } from "@ark-ui/solid";
import type { ProgressRootProps } from "@ark-ui/solid";
import { progressRecipe, type ProgressSize } from "@moderno-ui/core";

export type { ProgressSize } from "@moderno-ui/core";

export type ModernoProgressRootProps = ProgressRootProps & {
  /** Track thickness, circle size and type — resolves to `data-size` on the root part. */
  size?: ProgressSize;
};

/**
 * Progress.Root with the Moderno `size` recipe folded in. Ark's Root spreads
 * unknown props onto its `data-part="root"` element, so the recipe's
 * attribute rides along and `components.css` sizes the parts from it.
 */
function ProgressRoot(props: ModernoProgressRootProps) {
  const [local, rest] = splitProps(props, ["size"]);
  return <ArkProgress.Root {...rest} {...progressRecipe({ size: local.size })} />;
}

/**
 * Progress — how far a task has come, as a bar or a ring. Ark drives all of
 * it: the `Track` (linear) or the `Circle` (circular) is the
 * `role="progressbar"` with `aria-valuenow`, `aria-valuemin` and
 * `aria-valuemax`, every part carries `data-state` (`loading`, `complete`, or
 * `indeterminate` when `value` is `null`), the `Range` and `CircleRange` show
 * the percentage, `ValueText` prints it and `View` shows its children in one
 * state only. `Root` is wrapped to inject the recipe; every other part is
 * Ark's verbatim. The object is annotated so the emitted `.d.ts` doesn't
 * inline an un-nameable `@zag-js` type (TS2742).
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
} from "@ark-ui/solid";
