import { createContext, useContext } from "react";
import { Menu as ArkMenu } from "@ark-ui/react";
import type { MenuContentProps, MenuRootProps, MenuTriggerProps } from "@ark-ui/react";
import { menuRecipe, type MenuSize } from "@moderno-ui/core";

export type { MenuSize } from "@moderno-ui/core";

export interface ModernoMenuRootProps extends MenuRootProps {
  /** Trigger height and item density — resolves to `data-size` on the trigger and the content. A submenu takes its parent's size unless it sets its own. */
  size?: MenuSize;
}

/** The size of the nearest Menu.Root, for the parts that draw. */
const MenuSizeContext = createContext<MenuSize | undefined>(undefined);

/**
 * Menu.Root with the Moderno `size` folded in. Ark's Root renders no element,
 * so the size travels down a context to the trigger and the content, which
 * carry the recipe's `data-size`. A submenu's Root sits inside its parent's
 * content, so it reads the parent's size when it sets none of its own.
 */
function MenuRoot({ size, ...props }: ModernoMenuRootProps) {
  const parentSize = useContext(MenuSizeContext);
  return (
    <MenuSizeContext.Provider value={size ?? parentSize}>
      <ArkMenu.Root {...props} />
    </MenuSizeContext.Provider>
  );
}

/** Menu.Trigger with the menu's `data-size`, for its height and type size. */
function MenuTrigger(props: MenuTriggerProps) {
  return <ArkMenu.Trigger {...props} {...menuRecipe({ size: useContext(MenuSizeContext) })} />;
}

/** Menu.Content with the menu's `data-size`, for the items' density. */
function MenuContent(props: MenuContentProps) {
  return <ArkMenu.Content {...props} {...menuRecipe({ size: useContext(MenuSizeContext) })} />;
}

/**
 * Menu — a list of actions that opens from a button, with items, groups,
 * separators, checkbox and radio items, and submenus.
 *
 * Ark drives the machine: open state, focus, typeahead, arrow-key highlight
 * (`data-highlighted`), checked items (`data-state`) and submenus, which are a
 * nested `Menu.Root` opened by a `Menu.TriggerItem`. The content renders in a
 * `Portal`. Under a 40rem viewport the stylesheet presents the open menu as a
 * bottom sheet over a scrim. `Root`, `Trigger` and `Content` are wrapped for
 * the `size` recipe; every other part is Ark's verbatim. The object is
 * annotated so the emitted `.d.ts` doesn't inline an un-nameable `@zag-js`
 * type (TS2742).
 */
export const Menu: Omit<typeof ArkMenu, "Root" | "Trigger" | "Content"> & {
  Root: typeof MenuRoot;
  Trigger: typeof MenuTrigger;
  Content: typeof MenuContent;
} = {
  ...ArkMenu,
  Root: MenuRoot,
  Trigger: MenuTrigger,
  Content: MenuContent,
};

export type {
  MenuRootProps,
  MenuTriggerProps,
  MenuContextTriggerProps,
  MenuIndicatorProps,
  MenuPositionerProps,
  MenuContentProps,
  MenuArrowProps,
  MenuArrowTipProps,
  MenuItemProps,
  MenuItemTextProps,
  MenuItemIndicatorProps,
  MenuItemGroupProps,
  MenuItemGroupLabelProps,
  MenuCheckboxItemProps,
  MenuRadioItemGroupProps,
  MenuRadioItemProps,
  MenuSeparatorProps,
  MenuTriggerItemProps,
  MenuOpenChangeDetails,
  MenuSelectionDetails,
  MenuHighlightChangeDetails,
} from "@ark-ui/react";
