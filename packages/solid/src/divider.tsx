import { Show, splitProps, type JSX } from "solid-js";
import {
  dividerRecipe,
  partAttrs,
  type DividerAlign,
  type DividerOrientation,
} from "@moderno-ui/core";

export interface DividerProps extends JSX.HTMLAttributes<HTMLDivElement> {
  orientation?: DividerOrientation;
  align?: DividerAlign;
}

/**
 * Divider — the rule primitive, ported to Solid.
 *
 * Identical contract to `@moderno-ui/react`: a plain element carrying
 * `data-scope`/`data-part` plus the shared `dividerRecipe`'s
 * `data-orientation`/`data-align`, with the stroke drawn by `components.css`
 * from `--border`. `splitProps` peels the recipe props and the optional label
 * off; everything else is forwarded, and the scope/part/variant attrs are
 * spread last so they can't be clobbered — mirroring the React prop order.
 */
export function Divider(props: DividerProps) {
  const [local, rest] = splitProps(props, ["orientation", "align", "children"]);
  const hasLabel = () =>
    local.children !== undefined && local.children !== null && local.children !== false;
  return (
    <div
      role={hasLabel() ? undefined : "separator"}
      aria-orientation={hasLabel() ? undefined : (local.orientation ?? "horizontal")}
      {...rest}
      {...partAttrs("divider", "root")}
      {...dividerRecipe({ orientation: local.orientation, align: local.align })}
    >
      <Show when={hasLabel()}>
        <span {...partAttrs("divider", "label")}>{local.children}</span>
      </Show>
    </div>
  );
}

export type { DividerAlign, DividerOrientation } from "@moderno-ui/core";
