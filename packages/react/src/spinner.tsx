import type { ComponentPropsWithRef } from "react";
import { partAttrs, spinnerRecipe, type VariantProps } from "@moderno-ui/core";

export interface SpinnerProps
  extends
    Omit<ComponentPropsWithRef<"span">, "children">,
    VariantProps<typeof spinnerRecipe.variants> {
  /** What is loading, read by screen readers. */
  label?: string;
}

/**
 * Spinner — a spinning ring that says "something is loading" without a
 * progress value.
 *
 * CSS-only: the root is a `<span role="status">` carrying
 * `data-scope`/`data-part` plus `spinnerRecipe`'s `data-size`. Inside, the
 * `circle` part is the ring (hidden from assistive tech) and the `label` part
 * is visually hidden text, so screen readers read "Loading" (or `label`).
 * The ring paints with the text colour around it.
 */
export function Spinner({ size, label = "Loading", ...rest }: SpinnerProps) {
  return (
    <span role="status" {...rest} {...partAttrs("spinner", "root")} {...spinnerRecipe({ size })}>
      <span aria-hidden="true" {...partAttrs("spinner", "circle")} />
      <span {...partAttrs("spinner", "label")}>{label}</span>
    </span>
  );
}

export type { SpinnerSize } from "@moderno-ui/core";
