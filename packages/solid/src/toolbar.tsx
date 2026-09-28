import {
  Show,
  createContext,
  createMemo,
  createUniqueId,
  splitProps,
  useContext,
  type Accessor,
  type ComponentProps,
  type JSX,
} from "solid-js";
import { Tooltip as ArkTooltip, useToggle, useTooltip } from "@ark-ui/solid";
import { mergeProps, normalizeProps, useMachine, type PropTypes } from "@zag-js/solid";
import {
  toolbar,
  toolbarRecipe,
  toolbarTooltipText,
  toolbarTooltipTriggerProps,
  withoutEventHandlers,
  type ToolbarSize,
} from "@moderno-ui/core";
import { Portal } from "./dialog.js";
import { Tooltip } from "./tooltip.js";

export type { ToolbarSize } from "@moderno-ui/core";

/** The axis a toolbar's items run along. */
export type ToolbarOrientation = toolbar.Orientation;

export type ToolbarRootProps = ComponentProps<"div"> & {
  /**
   * Lays the items out in a row (Left/Right arrows) or a column (Up/Down).
   * @default "horizontal"
   */
  orientation?: ToolbarOrientation;
  /**
   * Height of every item: Button's sizes. Resolves to `data-size` on the root.
   * @default "md"
   */
  size?: ToolbarSize;
  /** Text direction. In `rtl` the Left and Right arrows swap. */
  dir?: "ltr" | "rtl";
};

interface ToolbarItemOwnProps {
  /**
   * Names an icon-only item: its `aria-label`, and the text of the tooltip it
   * shows on hover and keyboard focus.
   */
  label?: string;
  /** A keyboard shortcut the tooltip shows in parentheses after the label. */
  shortcut?: string;
  /** Keeps the item in the arrow-key order, announced as disabled, but it does nothing. */
  disabled?: boolean;
}

type ButtonProps = ComponentProps<"button">;

export type ToolbarButtonProps = ButtonProps & ToolbarItemOwnProps;

export type ToolbarToggleProps = ButtonProps &
  ToolbarItemOwnProps & {
    /** Controlled pressed state. Pair with `onPressedChange`. */
    pressed?: boolean;
    /**
     * Initial pressed state when uncontrolled.
     * @default false
     */
    defaultPressed?: boolean;
    /** Called with the new pressed state when the toggle is pressed. */
    onPressedChange?: (pressed: boolean) => void;
  };

export type ToolbarGroupProps = ComponentProps<"div">;

export type ToolbarSeparatorProps = ComponentProps<"div">;

type ToolbarApi = toolbar.Api<PropTypes>;

/** The connected toolbar machine, for the items inside the root. */
const ToolbarContext = createContext<Accessor<ToolbarApi>>();

function useToolbar(part: string): Accessor<ToolbarApi> {
  const api = useContext(ToolbarContext);
  if (!api) throw new Error(`Toolbar.${part} must be inside a Toolbar.Root.`);
  return api;
}

/**
 * Toolbar.Root — `role="toolbar"`, the toolbar machine and the recipe's
 * `data-size`. Name it with `aria-label`.
 */
function ToolbarRoot(props: ToolbarRootProps) {
  const [local, rest] = splitProps(props, ["orientation", "size", "dir", "id", "children"]);
  const machineId = createUniqueId();
  const service = useMachine(toolbar.machine, () => ({
    id: machineId,
    ids: local.id ? { root: local.id } : undefined,
    orientation: local.orientation,
    dir: local.dir,
  }));
  const api = createMemo(() => toolbar.connect(service, normalizeProps));
  const rootProps = mergeProps(
    () => api().getRootProps(),
    rest,
    () => toolbarRecipe({ size: local.size }),
  );
  return (
    <ToolbarContext.Provider value={api}>
      <div {...rootProps}>{local.children}</div>
    </ToolbarContext.Provider>
  );
}

/**
 * One item: the machine's props, the consumer's, and a tooltip when it has a
 * label. The consumer's handlers run first, so a Menu.Trigger merged in can
 * claim a key before the toolbar moves focus; a disabled item drops them. The
 * tooltip and a Menu.Trigger share the item's id, so both find it.
 */
function ToolbarItem(props: {
  part: "button" | "toggle";
  own: ToolbarItemOwnProps;
  itemProps: Accessor<ButtonProps>;
  consumer: ButtonProps;
  children?: JSX.Element;
}) {
  const generatedId = createUniqueId();
  const id = () => props.consumer.id ?? generatedId;
  const tooltip = useTooltip(() => ({ ids: { trigger: id() } }));
  const buttonProps = createMemo(() =>
    mergeProps(
      props.own.label
        ? {
            ...toolbarTooltipTriggerProps(tooltip().getTriggerProps()),
            "aria-label": props.own.label,
          }
        : {},
      props.itemProps(),
      props.own.disabled ? withoutEventHandlers(props.consumer) : { ...props.consumer },
      { id: id(), "data-scope": "toolbar", "data-part": props.part },
    ),
  );
  return (
    <>
      <button {...buttonProps()}>{props.children}</button>
      <Show when={props.own.label}>
        {(label) => (
          <ArkTooltip.RootProvider value={tooltip}>
            <Portal>
              <Tooltip.Positioner>
                <Tooltip.Content>{toolbarTooltipText(label(), props.own.shortcut)}</Tooltip.Content>
              </Tooltip.Positioner>
            </Portal>
          </ArkTooltip.RootProvider>
        )}
      </Show>
    </>
  );
}

/**
 * Toolbar.Button — one action. With a `label` and an icon as its child it is
 * an icon-only button, named by the label, which it shows as a tooltip.
 */
function ToolbarButton(props: ToolbarButtonProps) {
  const [own, local, consumer] = splitProps(props, ["label", "shortcut", "disabled"], ["children"]);
  const api = useToolbar("Button");
  const value = createUniqueId();
  return (
    <ToolbarItem
      part="button"
      own={own}
      itemProps={() => api().getButtonProps({ value, disabled: own.disabled })}
      consumer={consumer}
    >
      {local.children}
    </ToolbarItem>
  );
}

/** Toolbar.Toggle — a button that stays pressed (`aria-pressed`), like bold. */
function ToolbarToggle(props: ToolbarToggleProps) {
  const [own, pressable, local, rest] = splitProps(
    props,
    ["label", "shortcut", "disabled"],
    ["pressed", "defaultPressed", "onPressedChange"],
    ["children"],
  );
  const api = useToolbar("Toggle");
  const value = createUniqueId();
  const toggle = useToggle(pressable);
  const consumer = mergeProps(
    { onClick: () => toggle().setPressed(!toggle().pressed) },
    rest,
  ) as ButtonProps;
  return (
    <ToolbarItem
      part="toggle"
      own={own}
      itemProps={() =>
        api().getToggleProps({ value, disabled: own.disabled, pressed: toggle().pressed })
      }
      consumer={consumer}
    >
      {local.children}
    </ToolbarItem>
  );
}

/** Toolbar.Group — a run of related items, `role="group"`. Name it with `aria-label`. */
function ToolbarGroup(props: ToolbarGroupProps) {
  // Children render once, outside the merge: its getters would build them anew on every read.
  const [local, rest] = splitProps(props, ["children"]);
  const api = useToolbar("Group");
  return <div {...mergeProps(() => api().getGroupProps(), rest)}>{local.children}</div>;
}

/** Toolbar.Separator — a rule between groups, across the toolbar. */
function ToolbarSeparator(props: ToolbarSeparatorProps) {
  const api = useToolbar("Separator");
  return <div {...mergeProps(() => api().getSeparatorProps(), props)} />;
}

/**
 * Toolbar — a bar of buttons, toggles, groups and separators, like the top
 * bar of an editor (undo, redo, zoom, theme).
 *
 * The toolbar machine from `@moderno-ui/core` drives the keyboard: the whole
 * bar is one Tab stop, the arrow keys move between items (Left/Right in a
 * row, Up/Down in a column), Home and End go to the ends. A disabled item
 * stays in that order but does nothing. An item with a `label` is icon-only:
 * the label names it and shows in a tooltip, with its `shortcut`. A
 * `Menu.Trigger asChild` around a `Toolbar.Button` makes it a menu button.
 * Anatomy: `Root > Button + Toggle + Group > … + Separator`.
 */
export const Toolbar: {
  Root: typeof ToolbarRoot;
  Button: typeof ToolbarButton;
  Toggle: typeof ToolbarToggle;
  Group: typeof ToolbarGroup;
  Separator: typeof ToolbarSeparator;
} = {
  Root: ToolbarRoot,
  Button: ToolbarButton,
  Toggle: ToolbarToggle,
  Group: ToolbarGroup,
  Separator: ToolbarSeparator,
};
