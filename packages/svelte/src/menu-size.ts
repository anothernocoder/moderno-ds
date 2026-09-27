import { getContext, setContext } from "svelte";
import type { MenuSize } from "@moderno-ui/core";

/** Reads the size of the nearest Menu.Root; a getter, so it follows the prop. */
type MenuSizeGetter = () => MenuSize | undefined;

const MENU_SIZE = Symbol("ModernoMenuSize");
const noSize: MenuSizeGetter = () => undefined;

/** The size of the nearest Menu.Root, for the parts that draw. */
export function getMenuSize(): MenuSizeGetter {
  return getContext<MenuSizeGetter | undefined>(MENU_SIZE) ?? noSize;
}

/** Hands a Menu.Root's size to the trigger and the content below it. */
export function setMenuSize(size: MenuSizeGetter): void {
  setContext(MENU_SIZE, size);
}
