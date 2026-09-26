import type { ComponentPropsWithRef } from "react";
import { badgeRecipe, partAttrs, type VariantProps } from "@moderno-ui/core";

export interface BadgeProps
  extends ComponentPropsWithRef<"span">, VariantProps<typeof badgeRecipe.variants> {
  /** Show a small dot before the text, tinted like the badge. */
  dot?: boolean;
}

/**
 * Badge — a short, static label for a status or a count.
 *
 * CSS-only, like Divider: there is no behaviour to own, so the component is a
 * `<span>` carrying `data-scope`/`data-part` plus `badgeRecipe`'s
 * `data-variant`/`data-size`, and `components.css` paints every pixel. The
 * optional dot is its own `dot` part, hidden from assistive tech because the
 * text already says what the colour means.
 */
export function Badge({ variant, size, dot, children, ...rest }: BadgeProps) {
  return (
    <span {...rest} {...partAttrs("badge", "root")} {...badgeRecipe({ variant, size })}>
      {dot ? <span aria-hidden="true" {...partAttrs("badge", "dot")} /> : null}
      {children}
    </span>
  );
}

export type { BadgeVariant, BadgeSize } from "@moderno-ui/core";
