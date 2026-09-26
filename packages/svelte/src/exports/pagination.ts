import { Pagination as ArkPagination } from "@ark-ui/svelte";
import PaginationRoot from "../PaginationRoot.svelte";

/**
 * Pagination — a row of page buttons with prev/next, that skips the pages
 * far from the current one behind an ellipsis. Ark drives all of it: `count`
 * items split into pages of `pageSize`; the `Context` snippet hands back the
 * page list (`pages`, each a page or an ellipsis) to render as `Item`s and
 * `Ellipsis`es; the current item carries `aria-current="page"`; the triggers
 * are disabled at either end. `Root` is wrapped to inject the `size` recipe;
 * every other part is Ark's verbatim. Annotated so the emitted `.d.ts`
 * doesn't inline an un-nameable `@zag-js` type (TS2742).
 */
export const Pagination: Omit<typeof ArkPagination, "Root"> & { Root: typeof PaginationRoot } = {
  ...ArkPagination,
  Root: PaginationRoot,
};
export type { PaginationSize } from "@moderno-ui/core";
export type {
  PaginationPageChangeDetails,
  PaginationPageSizeChangeDetails,
  PaginationPageUrlDetails,
} from "@ark-ui/svelte";
