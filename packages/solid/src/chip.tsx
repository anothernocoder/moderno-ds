import { Show, splitProps, type JSX } from "solid-js";
import { chipRecipe, partAttrs, type ChipSize, type ChipVariant } from "@moderno-ui/core";

export interface ChipProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  variant?: ChipVariant;
  size?: ChipSize;
  /** Show a remove (×) button after the label. */
  removable?: boolean;
  /** Accessible name of the remove button. Name the chip: "Remove React". */
  removeLabel?: string;
  /** Called when the remove button is pressed. */
  onRemove?: () => void;
}

/**
 * Chip — a compact, optionally removable token, ported to Solid.
 *
 * Identical contract to `@moderno-ui/react`: a `<span>` root carrying
 * `data-scope`/`data-part` plus the shared `chipRecipe`'s
 * `data-variant`/`data-size`, the children inside the `label` part and — when
 * `removable` — a native `<button>` as the `remove-trigger` part. The press is
 * reported through `onRemove`; removing the chip is the consumer's job.
 */
export function Chip(props: ChipProps) {
  const [local, rest] = splitProps(props, [
    "variant",
    "size",
    "removable",
    "removeLabel",
    "onRemove",
    "children",
  ]);
  return (
    <span
      {...rest}
      {...partAttrs("chip", "root")}
      {...chipRecipe({ variant: local.variant, size: local.size })}
    >
      <span {...partAttrs("chip", "label")}>{local.children}</span>
      <Show when={local.removable}>
        <button
          type="button"
          aria-label={local.removeLabel ?? "Remove"}
          onClick={() => local.onRemove?.()}
          {...partAttrs("chip", "remove-trigger")}
        >
          <span aria-hidden="true">×</span>
        </button>
      </Show>
    </span>
  );
}

export type { ChipVariant, ChipSize } from "@moderno-ui/core";
