import SortableListRoot from "../SortableListRoot.svelte";
import SortableListItem from "../SortableListItem.svelte";
import SortableListItemHandle from "../SortableListItemHandle.svelte";
import SortableListItemTrigger from "../SortableListItemTrigger.svelte";

/**
 * SortableList — a vertical list whose items reorder by dragging (mouse,
 * touch, pen) or with the keyboard. It moves items only; it does not own
 * their content. The sortable-list machine in `@moderno-ui/core` holds the
 * behaviour: the drag threshold, the gap that opens where the item will
 * land, scrolling near an edge, roving focus (the list is one Tab stop),
 * Space to pick up, arrows to move, Space to drop, Escape to cancel, and the
 * announcements. Anatomy: `Root > Item > ItemHandle (optional) + ItemTrigger`.
 */
export const SortableList = {
  Root: SortableListRoot,
  Item: SortableListItem,
  ItemHandle: SortableListItemHandle,
  ItemTrigger: SortableListItemTrigger,
};
export type { SortableListSize } from "@moderno-ui/core";
export type {
  SortableListRootProps,
  SortableListItemProps,
  SortableListItemHandleProps,
  SortableListItemTriggerProps,
  SortableListReorderDetails,
  SortableListTranslations,
} from "../sortable-list-props.js";
