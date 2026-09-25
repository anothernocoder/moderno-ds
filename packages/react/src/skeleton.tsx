import type { ComponentPropsWithRef } from "react";
import { partAttrs, skeletonRecipe, type VariantProps } from "@moderno-ui/core";

export interface SkeletonProps
  extends
    Omit<ComponentPropsWithRef<"span">, "children">,
    VariantProps<typeof skeletonRecipe.variants> {}

/**
 * Skeleton — a muted placeholder shown where content is still loading.
 *
 * CSS-only, like Divider: an empty `<span>` (valid anywhere text is) carrying
 * `data-scope`/`data-part` plus `skeletonRecipe`'s `data-shape`;
 * `components.css` paints it as a block. It is hidden from assistive tech
 * because it has nothing to say: mark the loading region with `aria-busy`
 * instead. Size it with `style` or a class, like the content it replaces.
 */
export function Skeleton({ shape, ...rest }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      {...rest}
      {...partAttrs("skeleton", "root")}
      {...skeletonRecipe({ shape })}
    />
  );
}

export type { SkeletonShape } from "@moderno-ui/core";
