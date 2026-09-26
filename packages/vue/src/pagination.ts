import { defineComponent, h, type Component, type DefineComponent, type PropType } from "vue";
import { Pagination as ArkPagination } from "@ark-ui/vue";
import type {
  PaginationRootProps,
  PaginationPageChangeDetails,
  PaginationPageSizeChangeDetails,
} from "@ark-ui/vue";
import { paginationRecipe, type PaginationSize } from "@moderno-ui/core";

export type { PaginationSize } from "@moderno-ui/core";

/**
 * The Root's public surface: Ark's own props plus the Moderno `size` recipe.
 * Ark-Vue declares the change callbacks as emits rather than props, so they
 * are spelled out here — a `h()` caller (and a template) passes them as
 * `onPageChange` / `onUpdate:page` handlers, and `inheritAttrs: false`
 * forwards them untouched.
 */
export interface ModernoPaginationRootProps extends PaginationRootProps {
  size?: PaginationSize;
  onPageChange?: (details: PaginationPageChangeDetails) => void;
  onPageSizeChange?: (details: PaginationPageSizeChangeDetails) => void;
  "onUpdate:page"?: (page: number) => void;
  "onUpdate:pageSize"?: (pageSize: number) => void;
}

/**
 * Pagination.Root with the Moderno `size` recipe folded in. Ark's Root
 * spreads unknown attributes onto its `data-part="root"` element, so the
 * recipe's attribute rides along and `components.css` sizes the parts from
 * it. `count`, `pageSize`, `defaultPage`, `page`, `siblingCount`, … pass
 * straight through via attrs.
 */
const PaginationRootImpl = defineComponent({
  name: "ModernoPaginationRoot",
  inheritAttrs: false,
  props: {
    size: { type: String as PropType<PaginationSize>, default: undefined },
  },
  setup(props, { slots, attrs }) {
    // Ark's Root re-typed as a plain Component so the merged bag isn't checked
    // against its full prop union (we only add the recipe's data-*).
    const Root = ArkPagination.Root as unknown as Component;
    return () => h(Root, { ...attrs, ...paginationRecipe({ size: props.size }) }, slots);
  },
});

/**
 * Pagination — a row of page buttons with prev/next, that skips the pages
 * far from the current one behind an ellipsis. Ark drives all of it: `count`
 * items split into pages of `pageSize`; the `Context` slot hands back the
 * page list (`pages`, each a page or an ellipsis) to render as `Item`s and
 * `Ellipsis`es; the current item carries `aria-current="page"`; the triggers
 * are disabled at either end. `Root` is wrapped to inject the recipe; every
 * other part is Ark's verbatim.
 *
 * The whole object is annotated explicitly so the emitted `.d.ts` doesn't
 * inline an un-nameable type that points at internal `@zag-js` paths (TS2742).
 */
export const Pagination: Omit<typeof ArkPagination, "Root"> & {
  Root: DefineComponent<ModernoPaginationRootProps>;
} = {
  ...ArkPagination,
  Root: PaginationRootImpl as unknown as DefineComponent<ModernoPaginationRootProps>,
};

export type {
  PaginationRootProps,
  PaginationItemProps,
  PaginationEllipsisProps,
  PaginationFirstTriggerProps,
  PaginationPrevTriggerProps,
  PaginationNextTriggerProps,
  PaginationLastTriggerProps,
  PaginationPageChangeDetails,
  PaginationPageSizeChangeDetails,
  PaginationPageUrlDetails,
} from "@ark-ui/vue";
