import { splitProps, type JSX } from "solid-js";
import { partAttrs, spinnerRecipe, type SpinnerSize } from "@moderno-ui/core";

export interface SpinnerProps extends Omit<JSX.HTMLAttributes<HTMLSpanElement>, "children"> {
  size?: SpinnerSize;
  /** What is loading, read by screen readers. */
  label?: string;
}

/**
 * Spinner — a spinning ring that says "something is loading" without a
 * progress value, ported to Solid.
 *
 * Identical contract to `@moderno-ui/react`: a `<span role="status">` root
 * carrying `data-scope`/`data-part` plus the shared `spinnerRecipe`'s
 * `data-size`. The `circle` part is the ring, hidden from assistive tech; the
 * `label` part is visually hidden text read by screen readers ("Loading", or
 * `label`). The scope/part/size attrs are spread last so they can't be
 * clobbered.
 */
export function Spinner(props: SpinnerProps) {
  const [local, rest] = splitProps(props, ["size", "label"]);
  return (
    <span
      role="status"
      {...rest}
      {...partAttrs("spinner", "root")}
      {...spinnerRecipe({ size: local.size })}
    >
      <span aria-hidden="true" {...partAttrs("spinner", "circle")} />
      <span {...partAttrs("spinner", "label")}>{local.label ?? "Loading"}</span>
    </span>
  );
}

export type { SpinnerSize } from "@moderno-ui/core";
