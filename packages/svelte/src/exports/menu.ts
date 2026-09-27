import { Menu as ArkMenu } from "@ark-ui/svelte";
import MenuContent from "../MenuContent.svelte";
import MenuRoot from "../MenuRoot.svelte";
import MenuTrigger from "../MenuTrigger.svelte";

/**
 * Menu — a list of actions that opens from a button, with items, groups,
 * separators, checkbox and radio items, and submenus. Ark drives the machine:
 * open state, focus, typeahead, arrow-key highlight (`data-highlighted`),
 * checked items (`data-state`) and submenus, which are a nested `Menu.Root`
 * opened by a `Menu.TriggerItem`. Under a 40rem viewport the stylesheet
 * presents the open menu as a bottom sheet over a scrim. `Root`, `Trigger`
 * and `Content` are wrapped for the `size` recipe; every other part is Ark's
 * verbatim. Annotated so the emitted `.d.ts` doesn't inline an un-nameable
 * `@zag-js` type (TS2742).
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
export type { MenuSize } from "@moderno-ui/core";
export type {
  MenuOpenChangeDetails,
  MenuSelectionDetails,
  MenuHighlightChangeDetails,
} from "@ark-ui/svelte";
