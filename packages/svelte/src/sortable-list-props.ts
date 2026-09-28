/**
 * SortableList's prop types and the contexts its parts share, in a `.ts`
 * file rather than inside the `.svelte`s, for the same reason as
 * `callout-props.ts`: a `Props` interface declared inside a component's
 * instance script is not exported, so `index.ts` could not re-export it by
 * name.
 */
import { getContext, setContext, type Snippet } from "svelte";
import type { HTMLAttributes, HTMLButtonAttributes, HTMLLiAttributes } from "svelte/elements";
import type { sortableList, SortableListSize } from "@moderno-ui/core";

/** What `onReorder` receives: the new order, the moved item, and where it went. */
export type SortableListReorderDetails = sortableList.ReorderDetails;
/** The handle's name and the screen-reader announcements, for another language. */
export type SortableListTranslations = sortableList.SortableListTranslations;

export interface SortableListRootProps extends Omit<HTMLAttributes<HTMLUListElement>, "children"> {
  /** The items' values in their current order. Bindable: `bind:items`. */
  items?: string[];
  /** The items' values in their first order, when the list holds the order itself. */
  defaultItems?: string[];
  /** Called with the new order when an item is dropped in a new place. */
  onReorder?: (details: SortableListReorderDetails) => void;
  /** Stops every item from moving. Focus and each item's buttons still work. */
  disabled?: boolean;
  /** Item height and type — resolves to `data-size` on the root part. */
  size?: SortableListSize;
  /** The handle's name and the announcements, for another language. */
  translations?: Partial<SortableListTranslations>;
  /** The items. The snippet receives the current order. */
  children?: Snippet<[string[]]>;
}

export interface SortableListItemProps extends Omit<HTMLLiAttributes, "value"> {
  /** The item's value: one of the root's `items`. */
  value: string;
  /** The item's name, for its handle ("Reorder Logo") and the announcements. Defaults to `value`. */
  label?: string;
  /** Stops this item from moving. The others still move past it. */
  disabled?: boolean;
}

export type SortableListItemHandleProps = HTMLButtonAttributes;
export type SortableListItemTriggerProps = HTMLButtonAttributes;

type Api = sortableList.SortableListApi;

const LIST = Symbol("ModernoSortableList");
const ITEM = Symbol("ModernoSortableListItem");

/** Hands the connected list to the parts below the Root. */
export const setSortableList = (api: () => Api): void => void setContext(LIST, api);

/** The connected list, for a part inside `SortableList.Root`. */
export function getSortableList(part: string): () => Api {
  const api = getContext<(() => Api) | undefined>(LIST);
  if (!api) throw new Error(`SortableList.${part} must be inside SortableList.Root.`);
  return api;
}

/** Hands an item's props to its handle and trigger. */
export const setSortableListItem = (item: () => sortableList.ItemProps): void =>
  void setContext(ITEM, item);

/** The item's props, for a part inside `SortableList.Item`. */
export function getSortableListItem(part: string): () => sortableList.ItemProps {
  const item = getContext<(() => sortableList.ItemProps) | undefined>(ITEM);
  if (!item) throw new Error(`SortableList.${part} must be inside SortableList.Item.`);
  return item;
}
