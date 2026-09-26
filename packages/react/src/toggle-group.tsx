import { ToggleGroup as ArkToggleGroup } from "@ark-ui/react";
import type { ToggleGroupRootProps } from "@ark-ui/react";
import { toggleGroupRecipe, type ToggleGroupSize, type ToggleGroupVariant } from "@moderno-ui/core";

export type { ToggleGroupSize, ToggleGroupVariant } from "@moderno-ui/core";

export interface ModernoToggleGroupRootProps extends ToggleGroupRootProps {
  /** Visual style of every item — resolves to `data-variant` on the root part. */
  variant?: ToggleGroupVariant;
  /** Density of every item — resolves to `data-size` on the root part. */
  size?: ToggleGroupSize;
}

/**
 * ToggleGroup.Root with the Moderno `variant` × `size` recipe folded in.
 * Ark's Root spreads unknown props onto its `data-part="root"` element, so
 * the recipe's attributes ride along and `components.css` styles every item
 * from them.
 */
function ToggleGroupRoot({ variant, size, ...props }: ModernoToggleGroupRootProps) {
  return <ArkToggleGroup.Root {...props} {...toggleGroupRecipe({ variant, size })} />;
}

/**
 * ToggleGroup — a row of toggle buttons; one or several stay pressed.
 *
 * Ark drives the machine. Single selection (the default) makes the root a
 * `role="radiogroup"` and each `Item` a `role="radio"` button with
 * `aria-checked`; `multiple` makes it a `role="group"` of `aria-pressed`
 * buttons. Items carry `data-state="on|off"`, `data-disabled` and
 * `data-orientation`; arrow keys move focus between them. The recipe only
 * adds the `variant` and `size` a consumer picks. Anatomy: `Root > Item`.
 * `Root` is wrapped for the recipe; every other part is Ark's verbatim. The
 * object is annotated so the emitted `.d.ts` doesn't inline an un-nameable
 * `@zag-js` type (TS2742).
 */
export const ToggleGroup: Omit<typeof ArkToggleGroup, "Root"> & {
  Root: typeof ToggleGroupRoot;
} = {
  ...ArkToggleGroup,
  Root: ToggleGroupRoot,
};

export type {
  ToggleGroupRootProps,
  ToggleGroupItemProps,
  ToggleGroupValueChangeDetails,
} from "@ark-ui/react";
