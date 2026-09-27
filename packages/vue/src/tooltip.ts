import {
  computed,
  defineComponent,
  h,
  inject,
  provide,
  type Component,
  type ComputedRef,
  type DefineComponent,
  type InjectionKey,
  type PropType,
} from "vue";
import { Tooltip as ArkTooltip } from "@ark-ui/vue";
import type { TooltipRootProps, TooltipOpenChangeDetails } from "@ark-ui/vue";
import { tooltipRecipe, type TooltipSize } from "@moderno-ui/core";

export type { TooltipSize } from "@moderno-ui/core";

/**
 * The Root's public surface: Ark's own props plus the Moderno `size` recipe.
 * Ark-Vue declares the change callbacks as emits rather than props, so they
 * are spelled out here — a `h()` caller (and a template) passes them as
 * `onOpenChange` / `onUpdate:open` handlers, and `inheritAttrs: false`
 * forwards them untouched.
 */
export interface ModernoTooltipRootProps extends TooltipRootProps {
  /** Padding, type and arrow of the content — resolves to `data-size` on the content part. */
  size?: TooltipSize;
  onOpenChange?: (details: TooltipOpenChangeDetails) => void;
  "onUpdate:open"?: (open: boolean) => void;
}

/** The size a Tooltip.Root hands down to its Content. */
const TOOLTIP_SIZE: InjectionKey<ComputedRef<TooltipSize | undefined>> =
  Symbol("ModernoTooltipSize");

/**
 * Tooltip.Root with the Moderno `size` recipe folded in. Ark's Root renders
 * no element, so the size is provided to the Content, the surface. `open`,
 * `openDelay`, `positioning`, … pass straight through via attrs.
 */
const TooltipRootImpl = defineComponent({
  name: "ModernoTooltipRoot",
  inheritAttrs: false,
  props: {
    size: { type: String as PropType<TooltipSize>, default: undefined },
  },
  setup(props, { slots, attrs }) {
    provide(
      TOOLTIP_SIZE,
      computed(() => props.size),
    );
    // Ark's Root re-typed as a plain Component so the forwarded bag isn't
    // checked against its full prop union.
    const Root = ArkTooltip.Root as unknown as Component;
    return () => h(Root, attrs, slots);
  },
});

/**
 * Tooltip.Content carrying its Root's size as `data-size`, which
 * `components.css` keys the padding, type and arrow off.
 */
const TooltipContentImpl = defineComponent({
  name: "ModernoTooltipContent",
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    const size = inject(TOOLTIP_SIZE, undefined);
    const Content = ArkTooltip.Content as unknown as Component;
    return () => h(Content, { ...attrs, ...tooltipRecipe({ size: size?.value }) }, slots);
  },
});

/**
 * Tooltip — a short label that shows while the pointer rests on its trigger
 * or the trigger has keyboard focus, with an arrow pointing at it. Ark drives
 * the delays, Escape, the placement and the arrow, `aria-describedby` on the
 * trigger and the `tooltip` role on the content. Anatomy: `Root > Trigger +
 * Positioner > Content > Arrow > ArrowTip`, the positioner usually in a
 * `Portal`. `Root` and `Content` are wrapped for the size; every other part is
 * Ark's verbatim.
 *
 * The whole object is annotated explicitly so the emitted `.d.ts` doesn't
 * inline an un-nameable type that points at internal `@zag-js` paths (TS2742).
 */
export const Tooltip: Omit<typeof ArkTooltip, "Root" | "Content"> & {
  Root: DefineComponent<ModernoTooltipRootProps>;
  Content: typeof ArkTooltip.Content;
} = {
  ...ArkTooltip,
  Root: TooltipRootImpl as unknown as DefineComponent<ModernoTooltipRootProps>,
  Content: TooltipContentImpl as unknown as typeof ArkTooltip.Content,
};

export type {
  TooltipRootProps,
  TooltipTriggerProps,
  TooltipPositionerProps,
  TooltipContentProps,
  TooltipArrowProps,
  TooltipArrowTipProps,
  TooltipOpenChangeDetails,
} from "@ark-ui/vue";
