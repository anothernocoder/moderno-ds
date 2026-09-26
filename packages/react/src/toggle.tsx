import { Toggle as ArkToggle } from "@ark-ui/react";
import type { ToggleRootProps } from "@ark-ui/react";
import { toggleRecipe, type ToggleSize, type ToggleVariant } from "@moderno-ui/core";

export type { ToggleSize, ToggleVariant } from "@moderno-ui/core";

export interface ModernoToggleRootProps extends ToggleRootProps {
  /** Visual style — resolves to `data-variant` on the root part. */
  variant?: ToggleVariant;
  /** Control density — resolves to `data-size` on the root part. */
  size?: ToggleSize;
}

/**
 * Toggle.Root with the Moderno `variant` × `size` recipe folded in. Ark's
 * Root spreads unknown props onto its `<button data-part="root">`, so the
 * recipe's `data-variant`/`data-size` ride along for `components.css`.
 */
function ToggleRoot({ variant, size, ...props }: ModernoToggleRootProps) {
  return <ArkToggle.Root {...props} {...toggleRecipe({ variant, size })} />;
}

/**
 * Toggle — a button that stays pressed until it is pressed again.
 *
 * Ark drives the machine: the root is a native `<button>` with
 * `aria-pressed`, `data-state="on|off"`, `data-pressed` and `data-disabled`.
 * Those Ark attributes — not CVA variants — carry the state; the recipe only
 * adds the `variant` and `size` a consumer picks. Anatomy: `Root > Indicator`
 * (optional: shows its children while on and its `fallback` while off).
 * `Root` is wrapped for the recipe; `Indicator` and `Context` are Ark's
 * verbatim, so parts Ark adds later ride along through the spread. The object
 * is annotated so the emitted `.d.ts` doesn't inline an un-nameable `@zag-js`
 * type (TS2742).
 */
export const Toggle: Omit<typeof ArkToggle, "Root"> & { Root: typeof ToggleRoot } = {
  ...ArkToggle,
  Root: ToggleRoot,
};

export type { ToggleRootProps, ToggleIndicatorProps } from "@ark-ui/react";
