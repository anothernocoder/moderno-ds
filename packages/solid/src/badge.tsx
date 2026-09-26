import { Show, splitProps, type JSX } from "solid-js";
import { badgeRecipe, partAttrs, type BadgeSize, type BadgeVariant } from "@moderno-ui/core";

export interface BadgeProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  /** Show a small dot before the text, tinted like the badge. */
  dot?: boolean;
}

/**
 * Badge — a short, static label for a status or a count, ported to Solid.
 *
 * Identical contract to `@moderno-ui/react`: a `<span>` carrying
 * `data-scope`/`data-part` plus the shared `badgeRecipe`'s
 * `data-variant`/`data-size`, painted entirely by `components.css`. `dot`
 * adds the `dot` part, hidden from assistive tech. The scope/part/variant
 * attrs are spread last so they can't be clobbered.
 */
export function Badge(props: BadgeProps) {
  const [local, rest] = splitProps(props, ["variant", "size", "dot", "children"]);
  return (
    <span
      {...rest}
      {...partAttrs("badge", "root")}
      {...badgeRecipe({ variant: local.variant, size: local.size })}
    >
      <Show when={local.dot}>
        <span aria-hidden="true" {...partAttrs("badge", "dot")} />
      </Show>
      {local.children}
    </span>
  );
}

export type { BadgeVariant, BadgeSize } from "@moderno-ui/core";
