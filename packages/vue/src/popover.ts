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
import { Popover as ArkPopover } from "@ark-ui/vue";
import type {
  PopoverFocusOutsideEvent,
  PopoverInteractOutsideEvent,
  PopoverOpenChangeDetails,
  PopoverPointerDownOutsideEvent,
  PopoverRootProps,
} from "@ark-ui/vue";
import { popoverRecipe, type PopoverSize } from "@moderno-ui/core";

export type { PopoverSize } from "@moderno-ui/core";

/**
 * The Root's public surface: Ark's own props plus the Moderno `size` recipe.
 * Ark-Vue declares the callbacks as emits rather than props, so they are
 * spelled out here — a `h()` caller (and a template) passes them as
 * `onOpenChange` / `onUpdate:open` handlers, and `inheritAttrs: false`
 * forwards them untouched.
 */
export interface ModernoPopoverRootProps extends PopoverRootProps {
  /** Density of the content — resolves to `data-size` on the content part. */
  size?: PopoverSize;
  onOpenChange?: (details: PopoverOpenChangeDetails) => void;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onFocusOutside?: (event: PopoverFocusOutsideEvent) => void;
  onInteractOutside?: (event: PopoverInteractOutsideEvent) => void;
  onPointerDownOutside?: (event: PopoverPointerDownOutsideEvent) => void;
  onExitComplete?: () => void;
  "onUpdate:open"?: (open: boolean) => void;
}

/** The size a Root picked, read by its Content: Ark's Root renders no element to carry it. */
const POPOVER_SIZE: InjectionKey<() => PopoverSize | undefined> = Symbol("ModernoPopoverSize");

/**
 * Popover.Root with the Moderno `size` recipe: it provides the size to its
 * Content. `open`, `defaultOpen`, `positioning`, … and the handlers pass
 * straight through via attrs.
 */
const PopoverRootImpl = defineComponent({
  name: "ModernoPopoverRoot",
  inheritAttrs: false,
  props: {
    size: { type: String as PropType<PopoverSize>, default: undefined },
  },
  setup(props, { slots, attrs }) {
    provide(POPOVER_SIZE, () => props.size);
    // Ark's Root re-typed as a plain Component so the attrs bag isn't checked
    // against its full prop union.
    const Root = ArkPopover.Root as unknown as Component;
    return () => h(Root, attrs, slots);
  },
});

/**
 * Popover.Content with the recipe's `data-size` from its Root, so
 * `components.css` sets the surface's density from it.
 */
const PopoverContentImpl = defineComponent({
  name: "ModernoPopoverContent",
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    const size = inject(POPOVER_SIZE, () => undefined);
    const Content = ArkPopover.Content as unknown as Component;
    return () => h(Content, { ...attrs, ...popoverRecipe({ size: size() }) }, slots);
  },
});

/**
 * Popover — a non-modal surface anchored to its trigger, with an optional
 * arrow, title, description and close button. Ark drives all of it: it
 * places the content beside the trigger (flipping and sliding to stay on
 * screen), wires `aria-expanded` / `aria-controls` on the trigger and
 * `aria-labelledby` / `aria-describedby` on the `role="dialog"` content,
 * moves focus in on open and back on close, and closes on Escape or a click
 * outside. `Root` takes the `size` recipe and `Content` carries it; every
 * other part is Ark's verbatim.
 *
 * The whole object is annotated explicitly so the emitted `.d.ts` doesn't
 * inline an un-nameable type that points at internal `@zag-js` paths (TS2742).
 */
export const Popover: Omit<typeof ArkPopover, "Root" | "Content"> & {
  Root: DefineComponent<ModernoPopoverRootProps>;
  Content: typeof ArkPopover.Content;
} = {
  ...ArkPopover,
  Root: PopoverRootImpl as unknown as DefineComponent<ModernoPopoverRootProps>,
  Content: PopoverContentImpl as unknown as typeof ArkPopover.Content,
};

export type {
  PopoverRootProps,
  PopoverTriggerProps,
  PopoverIndicatorProps,
  PopoverAnchorProps,
  PopoverPositionerProps,
  PopoverContentProps,
  PopoverArrowProps,
  PopoverArrowTipProps,
  PopoverTitleProps,
  PopoverDescriptionProps,
  PopoverCloseTriggerProps,
  PopoverOpenChangeDetails,
} from "@ark-ui/vue";
