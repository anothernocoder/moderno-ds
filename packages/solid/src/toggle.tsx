import { splitProps } from "solid-js";
import { Toggle as ArkToggle } from "@ark-ui/solid";
import type { ToggleRootProps } from "@ark-ui/solid";
import { toggleRecipe, type ToggleSize, type ToggleVariant } from "@moderno-ui/core";

export type { ToggleSize, ToggleVariant } from "@moderno-ui/core";

export type ModernoToggleRootProps = ToggleRootProps & {
  /** Visual style — resolves to `data-variant` on the root part. */
  variant?: ToggleVariant;
  /** Control density — resolves to `data-size` on the root part. */
  size?: ToggleSize;
};

/**
 * Toggle.Root with the Moderno `variant` × `size` recipe folded in. Ark's
 * Root spreads unknown props onto its `<button data-part="root">`, so the
 * recipe's `data-variant`/`data-size` ride along for `components.css`.
 */
function ToggleRoot(props: ModernoToggleRootProps) {
  const [local, rest] = splitProps(props, ["variant", "size"]);
  return (
    <ArkToggle.Root {...rest} {...toggleRecipe({ variant: local.variant, size: local.size })} />
  );
}

/**
 * Toggle — a button that stays pressed until it is pressed again; Ark drives
 * all of it. The root is a native `<button>` with `aria-pressed`,
 * `data-state="on|off"`, `data-pressed` and `data-disabled`, and the optional
 * `Indicator` shows its children while on and its `fallback` while off. Ark
 * attributes, not CVA variants, carry the state. `Root` is wrapped to inject
 * the recipe; every other part is Ark's verbatim. The object is annotated so
 * the emitted `.d.ts` doesn't inline an un-nameable `@zag-js` type (TS2742).
 */
export const Toggle: Omit<typeof ArkToggle, "Root"> & { Root: typeof ToggleRoot } = {
  ...ArkToggle,
  Root: ToggleRoot,
};

export type { ToggleRootProps, ToggleIndicatorProps } from "@ark-ui/solid";
