import type { ComponentPropsWithRef } from "react";
import { chipRecipe, partAttrs, type VariantProps } from "@moderno-ui/core";

export interface ChipProps
  extends ComponentPropsWithRef<"span">, VariantProps<typeof chipRecipe.variants> {
  /** Show a remove (×) button after the label. */
  removable?: boolean;
  /** Accessible name of the remove button. Name the chip: "Remove React". */
  removeLabel?: string;
  /** Called when the remove button is pressed. */
  onRemove?: () => void;
}

/**
 * Chip — a compact token for a selected filter, a tag or a recipient, which
 * the user may remove.
 *
 * CSS-only: the root is a `<span>` carrying `data-scope`/`data-part` plus
 * `chipRecipe`'s `data-variant`/`data-size`. The children render inside a
 * `label` part (so a long label truncates), and `removable` adds a native
 * `<button>` as the `remove-trigger` part. The chip only reports the press
 * through `onRemove`; taking it out of the list is the consumer's job.
 */
export function Chip({
  variant,
  size,
  removable,
  removeLabel = "Remove",
  onRemove,
  children,
  ...rest
}: ChipProps) {
  return (
    <span {...rest} {...partAttrs("chip", "root")} {...chipRecipe({ variant, size })}>
      <span {...partAttrs("chip", "label")}>{children}</span>
      {removable ? (
        <button
          type="button"
          aria-label={removeLabel}
          onClick={onRemove}
          {...partAttrs("chip", "remove-trigger")}
        >
          <span aria-hidden="true">×</span>
        </button>
      ) : null}
    </span>
  );
}

export type { ChipVariant, ChipSize } from "@moderno-ui/core";
