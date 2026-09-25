import type { ComponentPropsWithRef } from "react";
import {
  indicatorAttrs,
  indicatorRole,
  partAttrs,
  type IndicatorAttrsProps,
} from "@moderno-ui/core";

export interface IndicatorProps extends ComponentPropsWithRef<"span">, IndicatorAttrsProps {}

/**
 * Indicator — a small status dot, with an optional label and pulse.
 *
 * CSS-only: the root is a `<span>` carrying `data-scope`/`data-part` plus the
 * shared `indicatorAttrs` (`data-variant`, `data-size` and, when `pulse` is
 * on, a bare `data-pulse`). The dot is always rendered and hidden from
 * assistive tech; the children become the `label` part. Colour alone says
 * nothing to a screen reader, so give a bare dot an `aria-label`: the root
 * then takes `role="img"` (see `indicatorRole`), which lets that name be read.
 */
export function Indicator({ variant, size, pulse, children, ...rest }: IndicatorProps) {
  const hasLabel = children !== undefined && children !== null && children !== false;
  return (
    <span
      role={indicatorRole(hasLabel, rest)}
      {...rest}
      {...partAttrs("indicator", "root")}
      {...indicatorAttrs({ variant, size, pulse })}
    >
      <span aria-hidden="true" {...partAttrs("indicator", "dot")} />
      {hasLabel ? <span {...partAttrs("indicator", "label")}>{children}</span> : null}
    </span>
  );
}

export type { IndicatorVariant, IndicatorSize } from "@moderno-ui/core";
