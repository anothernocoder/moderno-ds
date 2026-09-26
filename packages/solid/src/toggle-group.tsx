import { splitProps } from "solid-js";
import { ToggleGroup as ArkToggleGroup } from "@ark-ui/solid";
import type { ToggleGroupRootProps } from "@ark-ui/solid";
import { toggleGroupRecipe, type ToggleGroupSize, type ToggleGroupVariant } from "@moderno-ui/core";

export type { ToggleGroupSize, ToggleGroupVariant } from "@moderno-ui/core";

export type ModernoToggleGroupRootProps = ToggleGroupRootProps & {
  /** Visual style of every item — resolves to `data-variant` on the root part. */
  variant?: ToggleGroupVariant;
  /** Density of every item — resolves to `data-size` on the root part. */
  size?: ToggleGroupSize;
};

/**
 * ToggleGroup.Root with the Moderno `variant` × `size` recipe folded in.
 * Ark's Root spreads unknown props onto its `data-part="root"` element, so
 * the recipe's attributes ride along and `components.css` styles every item
 * from them.
 */
function ToggleGroupRoot(props: ModernoToggleGroupRootProps) {
  const [local, rest] = splitProps(props, ["variant", "size"]);
  return (
    <ArkToggleGroup.Root
      {...rest}
      {...toggleGroupRecipe({ variant: local.variant, size: local.size })}
    />
  );
}

/**
 * ToggleGroup — a row of toggle buttons; one or several stay pressed. Ark
 * drives all of it: single selection makes the root a `role="radiogroup"` of
 * `role="radio"` buttons, `multiple` a `role="group"` of `aria-pressed`
 * buttons; items carry `data-state="on|off"`, `data-disabled` and
 * `data-orientation`, and arrow keys move focus between them. `Root` is
 * wrapped to inject the recipe; every other part is Ark's verbatim. The
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
} from "@ark-ui/solid";
