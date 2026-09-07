import type { ComponentPropsWithRef } from "react";
import { dividerRecipe, partAttrs, type VariantProps } from "@moderno-ui/core";

export interface DividerProps
  extends ComponentPropsWithRef<"div">, VariantProps<typeof dividerRecipe.variants> {}

/**
 * Divider — a horizontal or vertical rule, optionally captioned.
 *
 * CSS-only, like Button: there is no Ark machine for a rule, so the component
 * is a plain element carrying `data-scope`/`data-part` plus the recipe's
 * `data-orientation`/`data-align`. The stroke itself is drawn by
 * `components.css` from the `--border` slot via the root's ::before/::after,
 * which is why the anatomy stays two parts (`root`, `label`) instead of
 * shipping filler elements for the line.
 *
 * Semantics follow the label: an unlabelled divider is `role="separator"` with
 * an `aria-orientation`, but `separator` makes its children presentational, so
 * a captioned divider drops the role rather than hiding its own caption from
 * assistive tech. Both are computed before `...rest` spreads, so a consumer can
 * still override them.
 */
export function Divider({ orientation, align, children, ...rest }: DividerProps) {
  const hasLabel = children !== undefined && children !== null && children !== false;
  return (
    <div
      role={hasLabel ? undefined : "separator"}
      aria-orientation={hasLabel ? undefined : (orientation ?? "horizontal")}
      {...rest}
      {...partAttrs("divider", "root")}
      {...dividerRecipe({ orientation, align })}
    >
      {hasLabel ? <span {...partAttrs("divider", "label")}>{children}</span> : null}
    </div>
  );
}
