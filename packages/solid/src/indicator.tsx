import { Show, splitProps, type JSX } from "solid-js";
import {
  indicatorAttrs,
  indicatorRole,
  partAttrs,
  type IndicatorAttrsProps,
} from "@moderno-ui/core";

export interface IndicatorProps extends JSX.HTMLAttributes<HTMLSpanElement>, IndicatorAttrsProps {}

/**
 * Indicator — a small status dot with an optional label and pulse, ported to
 * Solid.
 *
 * Identical contract to `@moderno-ui/react`: a `<span>` root carrying
 * `data-scope`/`data-part` plus the shared `indicatorAttrs` (`data-variant`,
 * `data-size`, and a bare `data-pulse` when `pulse` is on). The dot is always
 * rendered and hidden from assistive tech; the children become the `label`
 * part. A bare dot named by `aria-label` takes `role="img"` (`indicatorRole`).
 */
export function Indicator(props: IndicatorProps) {
  const [local, rest] = splitProps(props, ["variant", "size", "pulse", "children"]);
  const hasLabel = () =>
    local.children !== undefined && local.children !== null && local.children !== false;
  return (
    <span
      role={indicatorRole(hasLabel(), rest)}
      {...rest}
      {...partAttrs("indicator", "root")}
      {...indicatorAttrs({ variant: local.variant, size: local.size, pulse: local.pulse })}
    >
      <span aria-hidden="true" {...partAttrs("indicator", "dot")} />
      <Show when={hasLabel()}>
        <span {...partAttrs("indicator", "label")}>{local.children}</span>
      </Show>
    </span>
  );
}

export type { IndicatorVariant, IndicatorSize } from "@moderno-ui/core";
