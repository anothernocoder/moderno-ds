import type { EventObject, Machine, Service } from "@zag-js/core";
import type {
  CommonProperties,
  DirectionProperty,
  Orientation,
  PropTypes,
  RequiredBy,
} from "@zag-js/types";

/** The axis the items run along. The arrow keys follow it. */
export type ToolbarOrientation = Orientation;

export interface ToolbarProps extends DirectionProperty, CommonProperties {
  /** The ids of the elements the machine looks up, when the binding sets its own. */
  ids?: Partial<{ root: string }> | undefined;
  /**
   * Lays the items out in a row (Left/Right arrows) or a column (Up/Down).
   * @default "horizontal"
   */
  orientation?: ToolbarOrientation | undefined;
}

type PropsWithDefault = "orientation";

export interface ToolbarSchema {
  props: RequiredBy<ToolbarProps, PropsWithDefault>;
  context: {
    /**
     * The item that holds the toolbar's one Tab stop: the last one focused, or
     * the first item until then. `null` before the machine has seen the DOM.
     */
    activeValue: string | null;
  };
  state: "idle";
  event: EventObject;
  action:
    | "setActiveValue"
    | "syncActiveValue"
    | "focusNext"
    | "focusPrev"
    | "focusFirst"
    | "focusLast";
  effect: "trackItems";
}

export type ToolbarService = Service<ToolbarSchema>;

export type ToolbarMachine = Machine<ToolbarSchema>;

/** What every item passes to its props getter. */
export interface ItemProps {
  /** Tells the item apart from the others in the toolbar. A binding generates one. */
  value: string;
  /** Leaves the item in the arrow-key order but makes it do nothing. */
  disabled?: boolean | undefined;
}

export interface ToggleProps extends ItemProps {
  /** Whether the toggle is pressed. The binding owns this state. */
  pressed: boolean;
}

export interface ToolbarApi<T extends PropTypes = PropTypes> {
  /** The axis the items run along. */
  orientation: ToolbarOrientation;
  /** `role="toolbar"`, its orientation, and the id the items point back to. */
  getRootProps(): T["element"];
  /** A button in the toolbar: one arrow-key stop, `aria-disabled` when disabled. */
  getButtonProps(props: ItemProps): T["button"];
  /** A button that stays pressed: a button's props plus `aria-pressed` and `data-state`. */
  getToggleProps(props: ToggleProps): T["button"];
  /** A labelled run of related items, `role="group"`. */
  getGroupProps(): T["element"];
  /** A rule between groups, across the toolbar's axis. */
  getSeparatorProps(): T["element"];
}
