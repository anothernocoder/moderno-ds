import {
  computed,
  defineComponent,
  h,
  inject,
  provide,
  useId,
  type ComputedRef,
  type DefineComponent,
  type InjectionKey,
  type PropType,
} from "vue";
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue";
import {
  sortableList,
  sortableListGripIcon,
  sortableListRecipe,
  type SortableListSize,
} from "@moderno-ui/core";

export type { SortableListSize } from "@moderno-ui/core";

/** What `reorder` receives: the new order, the moved item, and where it went. */
export type SortableListReorderDetails = sortableList.ReorderDetails;
/** The handle's name and the screen-reader announcements, for another language. */
export type SortableListTranslations = sortableList.SortableListTranslations;

/**
 * The Root's public surface. The change is an emit, so it is spelled out
 * here too — a `h()` caller (and a template) passes it as an `onReorder` or
 * `onUpdate:items` handler; `v-model:items` binds the order.
 */
export interface SortableListRootProps {
  /** The items' values in their current order. Pair with `@reorder` or use `v-model:items`. */
  items?: string[];
  /** The items' values in their first order, when the list holds the order itself. */
  defaultItems?: string[];
  /** Stops every item from moving. Focus and each item's buttons still work. */
  disabled?: boolean;
  /** Item height and type — resolves to `data-size` on the root part. */
  size?: SortableListSize;
  /** The handle's name and the announcements, for another language. */
  translations?: Partial<SortableListTranslations>;
  id?: string;
  onReorder?: (details: SortableListReorderDetails) => void;
  "onUpdate:items"?: (items: string[]) => void;
}

export interface SortableListItemProps {
  /** The item's value: one of the root's `items`. */
  value: string;
  /** The item's name, for its handle ("Reorder Logo") and the announcements. Defaults to `value`. */
  label?: string;
  /** Stops this item from moving. The others still move past it. */
  disabled?: boolean;
}

type Api = sortableList.SortableListApi;

const LIST: InjectionKey<ComputedRef<Api>> = Symbol("ModernoSortableList");
const ITEM: InjectionKey<ComputedRef<sortableList.ItemProps>> = Symbol("ModernoSortableListItem");

function useSortableList(part: string): ComputedRef<Api> {
  const api = inject(LIST, null);
  if (!api) throw new Error(`SortableList.${part} must be inside SortableList.Root.`);
  return api;
}

function useSortableListItem(part: string): ComputedRef<sortableList.ItemProps> {
  const item = inject(ITEM, null);
  if (!item) throw new Error(`SortableList.${part} must be inside SortableList.Item.`);
  return item;
}

/**
 * SortableList.Root — the `<ul>`. It runs the sortable-list machine from
 * `@moderno-ui/core` and hands it to the items; the Moderno `size` recipe
 * lands on it. Its default slot receives `{ items }`, the current order.
 */
const SortableListRootImpl = defineComponent({
  name: "ModernoSortableListRoot",
  inheritAttrs: false,
  props: {
    items: { type: Array as PropType<string[]>, default: undefined },
    defaultItems: { type: Array as PropType<string[]>, default: undefined },
    disabled: { type: Boolean, default: undefined },
    size: { type: String as PropType<SortableListSize>, default: undefined },
    translations: {
      type: Object as PropType<Partial<SortableListTranslations>>,
      default: undefined,
    },
    id: { type: String, default: undefined },
  },
  emits: ["reorder", "update:items"],
  setup(props, { slots, attrs, emit }) {
    const generatedId = useId();
    const service = useMachine(
      sortableList.machine,
      computed(() => ({
        id: props.id ?? generatedId,
        items: props.items,
        defaultItems: props.defaultItems,
        disabled: props.disabled,
        translations: props.translations,
        onReorder(details: SortableListReorderDetails) {
          emit("reorder", details);
          emit("update:items", details.items);
        },
      })),
    );
    const api = computed(() => sortableList.connect(service, normalizeProps));
    provide(LIST, api);
    return () =>
      h(
        "ul",
        mergeProps(api.value.getRootProps(), sortableListRecipe({ size: props.size }), attrs),
        slots.default?.({ items: api.value.items }),
      );
  },
});

/** SortableList.Item — one `<li>`. It keeps any content; it moves as a whole. */
const SortableListItemImpl = defineComponent({
  name: "ModernoSortableListItem",
  inheritAttrs: false,
  props: {
    value: { type: String, required: true },
    label: { type: String, default: undefined },
    disabled: { type: Boolean, default: undefined },
  },
  setup(props, { slots, attrs }) {
    const api = useSortableList("Item");
    const item = computed(() => ({
      value: props.value,
      label: props.label,
      disabled: props.disabled,
    }));
    provide(ITEM, item);
    return () => h("li", mergeProps(api.value.getItemProps(item.value), attrs), slots.default?.());
  },
});

/** The default grip icon, from the shared geometry in core. */
const gripIcon = () =>
  h(
    "svg",
    { viewBox: sortableListGripIcon.viewBox, fill: "currentColor", "aria-hidden": "true" },
    sortableListGripIcon.dots.map(({ cx, cy }) =>
      h("circle", { cx, cy, r: sortableListGripIcon.radius }),
    ),
  );

/**
 * SortableList.ItemHandle — the optional grip button. With it, only the
 * handle drags; it is named "Reorder <label>" and Space on it picks the item
 * up. Its default slot replaces the grip icon.
 */
const SortableListItemHandleImpl = defineComponent({
  name: "ModernoSortableListItemHandle",
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    const api = useSortableList("ItemHandle");
    const item = useSortableListItem("ItemHandle");
    return () =>
      h(
        "button",
        mergeProps(api.value.getItemHandleProps(item.value), attrs),
        slots.default?.() ?? gripIcon(),
      );
  },
});

/**
 * SortableList.ItemTrigger — the item's one focus target, usually its name.
 * Up and Down move between the triggers; without a handle, Space on it picks
 * the item up.
 */
const SortableListItemTriggerImpl = defineComponent({
  name: "ModernoSortableListItemTrigger",
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    const api = useSortableList("ItemTrigger");
    const item = useSortableListItem("ItemTrigger");
    return () =>
      h("button", mergeProps(api.value.getItemTriggerProps(item.value), attrs), slots.default?.());
  },
});

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
export const SortableList: {
  Root: DefineComponent<SortableListRootProps>;
  Item: DefineComponent<SortableListItemProps>;
  ItemHandle: DefineComponent;
  ItemTrigger: DefineComponent;
} = {
  Root: SortableListRootImpl as unknown as DefineComponent<SortableListRootProps>,
  Item: SortableListItemImpl as unknown as DefineComponent<SortableListItemProps>,
  ItemHandle: SortableListItemHandleImpl as unknown as DefineComponent,
  ItemTrigger: SortableListItemTriggerImpl as unknown as DefineComponent,
};
