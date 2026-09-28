import type { Machine, Service } from "@zag-js/core";
import type { CommonProperties, Point, PropTypes, RequiredBy } from "@zag-js/types";

/** What `onReorder` receives once an item is dropped in a new place. */
export interface ReorderDetails {
  /** Every item's value, in the new order. */
  items: string[];
  /** The value of the item that moved. */
  value: string;
  /** Where the item was, counted from 0. */
  from: number;
  /** Where the item is now, counted from 0. */
  to: number;
}

/** What an announcement is built from. */
export interface AnnouncementDetails {
  /** The moved item's name, from its `label` (or its value). */
  label: string;
  /** Its place in the list, counted from 1. */
  position: number;
  /** How many items the list holds. */
  count: number;
}

/** The words the list uses: the handle's name and what a screen reader hears. */
export interface SortableListTranslations {
  /** The handle's accessible name: `"Reorder Logo"`. */
  handleLabel: (label: string) => string;
  /** Said when an item is picked up: `"Logo picked up. Position 3 of 12."` */
  pickedUp: (details: AnnouncementDetails) => string;
  /** Said each time a picked-up item moves: `"Moved to position 5."` */
  moved: (details: AnnouncementDetails) => string;
  /** Said when the item is dropped: `"Dropped."` */
  dropped: (details: AnnouncementDetails) => string;
  /** Said when a move is cancelled: `"Cancelled. Logo is back at position 3."` */
  cancelled: (details: AnnouncementDetails) => string;
}

/** Element ids, for composition. */
export type ElementIds = Partial<{
  root: string;
  item: (value: string) => string;
  itemHandle: (value: string) => string;
  itemTrigger: (value: string) => string;
}>;

export interface SortableListProps extends CommonProperties {
  /** The ids of the elements, for composition. */
  ids?: ElementIds | undefined;
  /** The items' values in their current order. Pair with `onReorder`. */
  items?: string[] | undefined;
  /** The items' values in their first order, when the list holds the order itself. */
  defaultItems?: string[] | undefined;
  /** Called with the new order when an item is dropped in a new place. */
  onReorder?: ((details: ReorderDetails) => void) | undefined;
  /** Stops every item from moving. Focus still moves between the items. */
  disabled?: boolean | undefined;
  /** The handle's name and the announcements, for another language. */
  translations?: Partial<SortableListTranslations> | undefined;
}

type PropsWithDefault = "defaultItems";

/** Which element of an item holds focus: its trigger (the default) or its handle. */
export type ItemFocusPart = "trigger" | "handle";

/** What moves an item: a pointer (mouse, touch, pen) or the keyboard. */
export type DragSource = "pointer" | "keyboard";

/** Where an item sat when the move started, relative to the top of the list. */
export interface ItemLayout {
  top: number;
  height: number;
}

interface PrivateContext {
  /** The items' values in order. */
  items: string[];
  /** The item that holds the list's one Tab stop. */
  focusedValue: string | null;
  /** Which element of that item holds it. */
  focusedPart: ItemFocusPart;
  /** The item being moved. */
  draggedValue: string | null;
  /** Where the moved item started. */
  fromIndex: number;
  /** Where the moved item would land now. */
  toIndex: number;
  /** Every item's box when the move started, in list order. */
  layout: ItemLayout[];
  /** How far a pointer has carried the moved item from its place. */
  pointerOffset: number;
  /** Where the moved item is drawn from its new place while it settles. */
  settleOffset: number;
}

interface Refs {
  /** The moved item's name, for the announcements. */
  draggedLabel: string;
  /** Where the pointer went down, and where the list's top was then. */
  pointerStart: (Point & { listTop: number }) | null;
  /** The pointer that is moving the item, so a second finger is ignored. */
  pointerId: number | null;
  /** The pointer's last position, so a scroll can move the item under it. */
  lastPoint: Point | null;
}

/** The list's states: at rest, a pointer pressed, moved by a pointer, moved by the keyboard, landing. */
export type SortableListState = "idle" | "pressing" | "dragging" | "picked" | "settling";

/** What an item tells the machine when it starts a move. */
interface ItemEventDetails {
  value: string;
  label: string;
  part: ItemFocusPart;
  disabled: boolean;
}

export type SortableListEvent =
  | { type: "ITEM.FOCUS"; value: string; part: ItemFocusPart }
  | { type: "FOCUS.NEXT" | "FOCUS.PREV" | "FOCUS.FIRST" | "FOCUS.LAST"; value: string }
  | { type: "FOCUS.PART"; value: string; part: ItemFocusPart }
  | ({ type: "PICK_UP" } & ItemEventDetails)
  | { type: "MOVE.NEXT" | "MOVE.PREV" | "MOVE.FIRST" | "MOVE.LAST" }
  | { type: "DROP" | "CANCEL" | "BLUR" }
  | ({ type: "POINTER.DOWN"; point: Point; pointerId: number } & ItemEventDetails)
  | { type: "POINTER.MOVE"; point: Point }
  | { type: "POINTER.UP" | "POINTER.CANCEL" | "SCROLL" | "SETTLED" };

export interface SortableListSchema {
  props: RequiredBy<SortableListProps, PropsWithDefault>;
  context: PrivateContext;
  refs: Refs;
  computed: {
    disabled: boolean;
    /** The English words with `translations` laid over them. */
    translations: SortableListTranslations;
  };
  state: SortableListState;
  event: SortableListEvent;
  action: string;
  effect: string;
  guard: string;
}

export type SortableListService = Service<SortableListSchema>;
export type SortableListMachine = Machine<SortableListSchema>;

/** What each item passes to the connect. */
export interface ItemProps {
  /** The item's value: one of `items`. */
  value: string;
  /** The item's name, for the handle and the announcements. Defaults to `value`. */
  label?: string | undefined;
  /** Stops this item from moving. */
  disabled?: boolean | undefined;
}

export interface ItemState {
  /** The item's place in the list, counted from 0. */
  index: number;
  /** Whether the item can not move. */
  disabled: boolean;
  /** How the item is being moved, if it is. */
  dragging: DragSource | undefined;
  /** Whether the item holds the list's one Tab stop. */
  tabStop: boolean;
  /** How far, in pixels, the item is drawn from its place. */
  offset: number;
}

export interface SortableListApi<T extends PropTypes = PropTypes> {
  /** The items' values in order. */
  items: string[];
  /** The item being moved, if any. */
  draggedValue: string | null;
  /** How the item is being moved, if one is. */
  dragging: DragSource | undefined;
  getItemState: (props: ItemProps) => ItemState;
  getRootProps: () => T["element"];
  getItemProps: (props: ItemProps) => T["element"];
  getItemHandleProps: (props: ItemProps) => T["button"];
  getItemTriggerProps: (props: ItemProps) => T["button"];
}
