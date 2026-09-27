import {
  defineComponent,
  h,
  inject,
  provide,
  type Component,
  type DefineComponent,
  type InjectionKey,
  type PropType,
} from "vue";
import { Menu as ArkMenu } from "@ark-ui/vue";
import type {
  MenuRootProps,
  MenuFocusOutsideEvent,
  MenuHighlightChangeDetails,
  MenuInteractOutsideEvent,
  MenuOpenChangeDetails,
  MenuPointerDownOutsideEvent,
  MenuSelectionDetails,
} from "@ark-ui/vue";
import { menuRecipe, type MenuSize } from "@moderno-ui/core";

export type { MenuSize } from "@moderno-ui/core";

/**
 * The Root's public surface: Ark's own props plus the Moderno `size` recipe.
 * Ark-Vue declares the callbacks as emits rather than props, so they are
 * spelled out here — a template listens with `@select`, `@open-change` or
 * `v-model:open`, and `inheritAttrs: false` forwards them untouched.
 */
export interface ModernoMenuRootProps extends MenuRootProps {
  /** Trigger height and item density — resolves to `data-size` on the trigger and the content. A submenu takes its parent's size unless it sets its own. */
  size?: MenuSize;
  onSelect?: (details: MenuSelectionDetails) => void;
  onOpenChange?: (details: MenuOpenChangeDetails) => void;
  onHighlightChange?: (details: MenuHighlightChangeDetails) => void;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onFocusOutside?: (event: MenuFocusOutsideEvent) => void;
  onInteractOutside?: (event: MenuInteractOutsideEvent) => void;
  onPointerDownOutside?: (event: MenuPointerDownOutsideEvent) => void;
  onExitComplete?: () => void;
  "onUpdate:open"?: (open: boolean) => void;
  "onUpdate:highlightedValue"?: (highlightedValue: string | null) => void;
}

/** The size of the nearest Menu.Root, for the parts that draw. */
const MENU_SIZE: InjectionKey<() => MenuSize | undefined> = Symbol("ModernoMenuSize");
const noSize = () => undefined;

/**
 * Menu.Root with the Moderno `size` folded in. Ark's Root renders no element,
 * so the size is provided to the trigger and the content, which carry the
 * recipe's `data-size`. A submenu's Root sits inside its parent's content, so
 * it reads the parent's size when it sets none of its own. Every Ark prop and
 * listener passes straight through via attrs.
 */
const MenuRootImpl = defineComponent({
  name: "ModernoMenuRoot",
  inheritAttrs: false,
  props: {
    size: { type: String as PropType<MenuSize>, default: undefined },
  },
  setup(props, { slots, attrs }) {
    const parentSize = inject(MENU_SIZE, noSize);
    provide(MENU_SIZE, () => props.size ?? parentSize());
    // Ark's Root re-typed as a plain Component so the attrs bag isn't checked
    // against its full prop union.
    const Root = ArkMenu.Root as unknown as Component;
    return () => h(Root, attrs, slots);
  },
});

/** One of Ark's parts, with the menu's `data-size` added: the trigger or the content. */
function withMenuSize(name: string, part: Component) {
  return defineComponent({
    name,
    inheritAttrs: false,
    setup(_, { slots, attrs }) {
      const size = inject(MENU_SIZE, noSize);
      return () => h(part, { ...attrs, ...menuRecipe({ size: size() }) }, slots);
    },
  });
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
 * the `size` recipe; every other part is Ark's verbatim.
 *
 * The whole object is annotated explicitly so the emitted `.d.ts` doesn't
 * inline an un-nameable type that points at internal `@zag-js` paths (TS2742).
 */
export const Menu: Omit<typeof ArkMenu, "Root"> & {
  Root: DefineComponent<ModernoMenuRootProps>;
} = {
  ...ArkMenu,
  Root: MenuRootImpl as unknown as DefineComponent<ModernoMenuRootProps>,
  Trigger: withMenuSize(
    "ModernoMenuTrigger",
    ArkMenu.Trigger as unknown as Component,
  ) as unknown as typeof ArkMenu.Trigger,
  Content: withMenuSize(
    "ModernoMenuContent",
    ArkMenu.Content as unknown as Component,
  ) as unknown as typeof ArkMenu.Content,
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
} from "@ark-ui/vue";
