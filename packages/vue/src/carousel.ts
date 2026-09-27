import {
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  type Component,
  type DefineComponent,
  type PropType,
} from "vue";
import { Carousel as ArkCarousel } from "@ark-ui/vue";
import type {
  CarouselRootProps,
  CarouselPageChangeDetails,
  CarouselAutoplayStatusDetails,
  CarouselDragStatusDetails,
} from "@ark-ui/vue";
import {
  REDUCED_MOTION_QUERY,
  carouselMotion,
  carouselRecipe,
  type CarouselSize,
} from "@moderno-ui/core";

export type { CarouselSize } from "@moderno-ui/core";

/**
 * The Root's public surface: Ark's own props plus the Moderno `size` recipe.
 * Ark-Vue declares the change callbacks as emits rather than props, so they
 * are spelled out here — a `h()` caller (and a template) passes them as
 * `onPageChange` / `onUpdate:page` handlers, and `inheritAttrs: false`
 * forwards them untouched.
 */
export interface ModernoCarouselRootProps extends CarouselRootProps {
  size?: CarouselSize;
  onPageChange?: (details: CarouselPageChangeDetails) => void;
  onAutoplayStatusChange?: (details: CarouselAutoplayStatusDetails) => void;
  onDragStatusChange?: (details: CarouselDragStatusDetails) => void;
  "onUpdate:page"?: (page: number) => void;
}

/**
 * Whether the reader asked for reduced motion. It reads `false` on the server
 * and until the client mounts, so the hydrated markup matches, then follows
 * the media query.
 */
function usePrefersReducedMotion() {
  const prefersReducedMotion = ref(false);
  let query: MediaQueryList | undefined;
  const update = () => {
    prefersReducedMotion.value = query?.matches ?? false;
  };
  onMounted(() => {
    query = window.matchMedia(REDUCED_MOTION_QUERY);
    update();
    query.addEventListener("change", update);
  });
  onBeforeUnmount(() => query?.removeEventListener("change", update));
  return prefersReducedMotion;
}

/**
 * Carousel.Root with the Moderno `size` recipe folded in, and autoplay held
 * off while the reader prefers reduced motion. Ark's Root spreads unknown
 * attributes onto its `data-part="root"` element, so the recipe's attribute
 * rides along and `components.css` sizes the controls from it.
 * `slideCount`, `slidesPerPage`, `page`, `spacing`, … pass straight through
 * via attrs.
 */
const CarouselRootImpl = defineComponent({
  name: "ModernoCarouselRoot",
  inheritAttrs: false,
  props: {
    size: { type: String as PropType<CarouselSize>, default: undefined },
    autoplay: {
      type: [Boolean, Object] as PropType<CarouselRootProps["autoplay"]>,
      default: undefined,
    },
    loop: { type: Boolean, default: undefined },
  },
  setup(props, { slots, attrs }) {
    // Ark's Root re-typed as a plain Component so the merged bag isn't checked
    // against its full prop union (we only add the recipe's data-* and the
    // motion props).
    const Root = ArkCarousel.Root as unknown as Component;
    const prefersReducedMotion = usePrefersReducedMotion();
    return () =>
      h(
        Root,
        {
          ...attrs,
          ...carouselMotion(
            { autoplay: props.autoplay, loop: props.loop },
            prefersReducedMotion.value,
          ),
          ...carouselRecipe({ size: props.size }),
        },
        slots,
      );
  },
});

/**
 * Carousel — slides that scroll one page at a time, with prev/next triggers
 * and one indicator per page. Ark drives all of it: `slideCount` slides,
 * `slidesPerPage` of them on a page; the item group scrolls and snaps to each
 * page; the current indicator carries `data-current`; prev/next are disabled
 * at either end unless the carousel loops. `Root` is wrapped to inject the
 * recipe and hold autoplay under reduced motion; every other part is Ark's
 * verbatim.
 *
 * The whole object is annotated explicitly so the emitted `.d.ts` doesn't
 * inline an un-nameable type that points at internal `@zag-js` paths (TS2742).
 */
export const Carousel: Omit<typeof ArkCarousel, "Root"> & {
  Root: DefineComponent<ModernoCarouselRootProps>;
} = {
  ...ArkCarousel,
  Root: CarouselRootImpl as unknown as DefineComponent<ModernoCarouselRootProps>,
};

export type {
  CarouselRootProps,
  CarouselItemGroupProps,
  CarouselItemProps,
  CarouselControlProps,
  CarouselPrevTriggerProps,
  CarouselNextTriggerProps,
  CarouselIndicatorGroupProps,
  CarouselIndicatorProps,
  CarouselAutoplayTriggerProps,
  CarouselAutoplayIndicatorProps,
  CarouselProgressTextProps,
  CarouselPageChangeDetails,
  CarouselAutoplayStatusDetails,
  CarouselDragStatusDetails,
} from "@ark-ui/vue";
