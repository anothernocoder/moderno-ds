import { splitProps } from "solid-js";
import { Pagination as ArkPagination } from "@ark-ui/solid";
import type { PaginationRootProps } from "@ark-ui/solid";
import { paginationRecipe, type PaginationSize } from "@moderno-ui/core";

export type { PaginationSize } from "@moderno-ui/core";

export type ModernoPaginationRootProps = PaginationRootProps & {
  /** Height and type of every page button, trigger and ellipsis — resolves to `data-size` on the root part. */
  size?: PaginationSize;
};

/**
 * Pagination.Root with the Moderno `size` recipe folded in. Ark's Root
 * spreads unknown props onto its `data-part="root"` element, so the recipe's
 * attribute rides along and `components.css` sizes the parts from it.
 */
function PaginationRoot(props: ModernoPaginationRootProps) {
  const [local, rest] = splitProps(props, ["size"]);
  return <ArkPagination.Root {...rest} {...paginationRecipe({ size: local.size })} />;
}

/**
 * Pagination — a row of page buttons with prev/next, that skips the pages
 * far from the current one behind an ellipsis. Ark drives all of it: `count`
 * items split into pages of `pageSize`; the `Context` hands back the page
 * list (`pages`, each a page or an ellipsis) to render as `Item`s and
 * `Ellipsis`es; the current item carries `aria-current="page"`; the triggers
 * are disabled at either end. `Root` is wrapped to inject the recipe; every
 * other part is Ark's verbatim. The object is annotated so the emitted
 * `.d.ts` doesn't inline an un-nameable `@zag-js` type (TS2742).
 */
export const Pagination: Omit<typeof ArkPagination, "Root"> & {
  Root: typeof PaginationRoot;
} = {
  ...ArkPagination,
  Root: PaginationRoot,
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
} from "@ark-ui/solid";
