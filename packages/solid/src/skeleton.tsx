import { splitProps, type JSX } from "solid-js";
import { partAttrs, skeletonRecipe, type SkeletonShape } from "@moderno-ui/core";

export interface SkeletonProps extends Omit<JSX.HTMLAttributes<HTMLSpanElement>, "children"> {
  shape?: SkeletonShape;
}

/**
 * Skeleton — a muted placeholder shown where content is still loading, ported
 * to Solid.
 *
 * Identical contract to `@moderno-ui/react`: an empty `<span>` carrying
 * `data-scope`/`data-part` plus the shared `skeletonRecipe`'s `data-shape`,
 * painted as a block by `components.css`. It is `aria-hidden` (a consumer
 * prop can override it); mark the loading region with `aria-busy` instead.
 * The scope/part/shape attrs are spread last so they can't be clobbered.
 */
export function Skeleton(props: SkeletonProps) {
  const [local, rest] = splitProps(props, ["shape"]);
  return (
    <span
      aria-hidden="true"
      {...rest}
      {...partAttrs("skeleton", "root")}
      {...skeletonRecipe({ shape: local.shape })}
    />
  );
}

export type { SkeletonShape } from "@moderno-ui/core";
