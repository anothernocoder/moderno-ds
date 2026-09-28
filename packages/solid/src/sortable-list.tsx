import {
  createContext,
  createMemo,
  createUniqueId,
  For,
  splitProps,
  untrack,
  useContext,
  type Accessor,
  type JSX,
} from "solid-js";
import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid";
import {
  sortableList,
  sortableListGripIcon,
  sortableListRecipe,
  type SortableListSize,
} from "@moderno-ui/core";

export type { SortableListSize } from "@moderno-ui/core";

/** What `onReorder` receives: the new order, the moved item, and where it went. */
export type SortableListReorderDetails = sortableList.ReorderDetails;
/** The handle's name and the screen-reader announcements, for another language. */
export type SortableListTranslations = sortableList.SortableListTranslations;

export interface SortableListRootProps extends Omit<
  JSX.HTMLAttributes<HTMLUListElement>,
  "children"
> {
  /** The items' values in their current order. Pair with `onReorder`. */
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
  /**
   * The items. A function receives the current order as an accessor, for a
   * list that holds it itself.
   */
  children?: JSX.Element | ((items: Accessor<string[]>) => JSX.Element);
}

export interface SortableListItemProps extends JSX.LiHTMLAttributes<HTMLLIElement> {
  /** The item's value: one of the root's `items`. */
  value: string;
  /** The item's name, for its handle ("Reorder Logo") and the announcements. Defaults to `value`. */
  label?: string;
  /** Stops this item from moving. The others still move past it. */
  disabled?: boolean;
}

export type SortableListItemHandleProps = JSX.ButtonHTMLAttributes<HTMLButtonElement>;
export type SortableListItemTriggerProps = JSX.ButtonHTMLAttributes<HTMLButtonElement>;

type Api = sortableList.SortableListApi;

const SortableListContext = createContext<Accessor<Api>>();
const SortableListItemContext = createContext<Accessor<sortableList.ItemProps>>();

function useSortableList(part: string): Accessor<Api> {
  const api = useContext(SortableListContext);
  if (!api) throw new Error(`SortableList.${part} must be inside SortableList.Root.`);
  return api;
}

function useSortableListItem(part: string): Accessor<sortableList.ItemProps> {
  const item = useContext(SortableListItemContext);
  if (!item) throw new Error(`SortableList.${part} must be inside SortableList.Item.`);
  return item;
}

/**
 * SortableList.Root — the `<ul>`. It runs the sortable-list machine from
 * `@moderno-ui/core` and hands it to the items; the Moderno `size` recipe
 * lands on it.
 */
function SortableListRoot(props: SortableListRootProps) {
  const [local, machineProps, rest] = splitProps(
    props,
    ["size", "children"],
    ["id", "items", "defaultItems", "onReorder", "disabled", "translations"],
  );
  const generatedId = createUniqueId();
  const service = useMachine(sortableList.machine, () => ({
    id: machineProps.id ?? generatedId,
    items: machineProps.items,
    defaultItems: machineProps.defaultItems,
    onReorder: machineProps.onReorder,
    disabled: machineProps.disabled,
    translations: machineProps.translations,
  }));
  const api = createMemo(() => sortableList.connect(service, normalizeProps));
  const rootProps = mergeProps(
    () => api().getRootProps(),
    () => sortableListRecipe({ size: local.size }),
    rest,
  );
  // A render function takes an argument; a function of none is Solid's own
  // children accessor. The render function runs once and reads the order
  // through its accessor, so a change re-renders only what reads it.
  const children = (): JSX.Element => {
    const content = local.children;
    if (typeof content !== "function" || content.length === 0) return content as JSX.Element;
    return untrack(() => content(() => api().items));
  };
  return (
    <SortableListContext.Provider value={api}>
      <ul {...rootProps}>{children()}</ul>
    </SortableListContext.Provider>
  );
}

/** SortableList.Item — one `<li>`. It keeps any content; it moves as a whole. */
function SortableListItem(props: SortableListItemProps) {
  const [itemProps, rest] = splitProps(props, ["value", "label", "disabled"]);
  const api = useSortableList("Item");
  const item = createMemo(() => ({
    value: itemProps.value,
    label: itemProps.label,
    disabled: itemProps.disabled,
  }));
  const itemAttrs = mergeProps(() => api().getItemProps(item()), rest);
  return (
    <SortableListItemContext.Provider value={item}>
      <li {...itemAttrs} />
    </SortableListItemContext.Provider>
  );
}

/** The default grip icon, from the shared geometry in core. */
function GripIcon() {
  return (
    <svg viewBox={sortableListGripIcon.viewBox} fill="currentColor" aria-hidden="true">
      <For each={sortableListGripIcon.dots}>
        {(dot) => <circle cx={dot.cx} cy={dot.cy} r={sortableListGripIcon.radius} />}
      </For>
    </svg>
  );
}

/**
 * SortableList.ItemHandle — the optional grip button. With it, only the
 * handle drags; it is named "Reorder <label>" and Space on it picks the item
 * up. Its children replace the grip icon.
 */
function SortableListItemHandle(props: SortableListItemHandleProps) {
  const [local, rest] = splitProps(props, ["children"]);
  const api = useSortableList("ItemHandle");
  const item = useSortableListItem("ItemHandle");
  const handleAttrs = mergeProps(() => api().getItemHandleProps(item()), rest);
  return <button {...handleAttrs}>{local.children ?? <GripIcon />}</button>;
}

/**
 * SortableList.ItemTrigger — the item's one focus target, usually its name.
 * Up and Down move between the triggers; without a handle, Space on it picks
 * the item up.
 */
function SortableListItemTrigger(props: SortableListItemTriggerProps) {
  const api = useSortableList("ItemTrigger");
  const item = useSortableListItem("ItemTrigger");
  const triggerAttrs = mergeProps(() => api().getItemTriggerProps(item()), props);
  return <button {...triggerAttrs} />;
}

/**
 * SortableList — a vertical list whose items reorder by dragging (mouse,
 * touch, pen) or with the keyboard. It moves items only; it does not own
 * their content.
 *
 * The sortable-list machine in `@moderno-ui/core` holds the behaviour: the
 * drag threshold, the gap that opens where the item will land, scrolling
 * near an edge, roving focus (the list is one Tab stop), Space to pick up,
 * arrows to move, Space to drop, Escape to cancel, and the announcements.
 * Anatomy: `Root > Item > ItemHandle (optional) + ItemTrigger`.
 */
export const SortableList = {
  Root: SortableListRoot,
  Item: SortableListItem,
  ItemHandle: SortableListItemHandle,
  ItemTrigger: SortableListItemTrigger,
};
