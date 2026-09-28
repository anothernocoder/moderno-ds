import { createContext, useContext, useId, type ComponentPropsWithRef } from "react";
import { Portal, Tooltip as ArkTooltip, useToggle, useTooltip } from "@ark-ui/react";
import { mergeProps, normalizeProps, useMachine, type PropTypes } from "@zag-js/react";
import {
  splitToolbarKeyDown,
  toolbar,
  toolbarRecipe,
  toolbarTooltipText,
  toolbarTooltipTriggerProps,
  withoutEventHandlers,
  type ToolbarSize,
} from "@moderno-ui/core";
import { Tooltip } from "./tooltip.js";

export type { ToolbarSize } from "@moderno-ui/core";

/** The axis a toolbar's items run along. */
export type ToolbarOrientation = toolbar.Orientation;

export interface ToolbarRootProps extends ComponentPropsWithRef<"div"> {
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
}

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

type ButtonProps = ComponentPropsWithRef<"button">;

export interface ToolbarButtonProps extends ButtonProps, ToolbarItemOwnProps {}

export interface ToolbarToggleProps extends ButtonProps, ToolbarItemOwnProps {
  /** Controlled pressed state. Pair with `onPressedChange`. */
  pressed?: boolean;
  /**
   * Initial pressed state when uncontrolled.
   * @default false
   */
  defaultPressed?: boolean;
  /** Called with the new pressed state when the toggle is pressed. */
  onPressedChange?: (pressed: boolean) => void;
}

export type ToolbarGroupProps = ComponentPropsWithRef<"div">;

export type ToolbarSeparatorProps = ComponentPropsWithRef<"div">;

/** The connected toolbar machine, for the items inside the root. */
const ToolbarContext = createContext<toolbar.Api<PropTypes> | null>(null);

function useToolbar(part: string): toolbar.Api<PropTypes> {
  const api = useContext(ToolbarContext);
  if (!api) throw new Error(`Toolbar.${part} must be inside a Toolbar.Root.`);
  return api;
}

/**
 * Toolbar.Root — `role="toolbar"`, the toolbar machine and the recipe's
 * `data-size`. Name it with `aria-label`.
 */
function ToolbarRoot({ orientation, size, dir, id, children, ...rest }: ToolbarRootProps) {
  const service = useMachine(toolbar.machine, {
    id: useId(),
    ids: id ? { root: id } : undefined,
    orientation,
    dir,
  });
  const api = toolbar.connect(service, normalizeProps);
  return (
    <ToolbarContext.Provider value={api}>
      <div {...mergeProps(api.getRootProps(), rest)} {...toolbarRecipe({ size })}>
        {children}
      </div>
    </ToolbarContext.Provider>
  );
}

interface ToolbarItemProps extends ToolbarItemOwnProps {
  /** Which part the item is. */
  part: "button" | "toggle";
  /** The machine's props for this item. */
  itemProps: ButtonProps;
  /** What the consumer (or a Menu.Trigger around the item) passed. */
  props: ButtonProps;
}

/**
 * One item: the machine's props, the consumer's, and a tooltip when it has a
 * label. The toolbar's key handler runs first, so its arrows move focus even
 * on a Menu.Trigger merged in; the consumer's other handlers run before the
 * machine's, and a disabled item drops them. The tooltip and a Menu.Trigger
 * share the item's id, so both find it.
 */
function ToolbarItem({ part, label, shortcut, disabled, itemProps, props }: ToolbarItemProps) {
  const generatedId = useId();
  const id = props.id ?? generatedId;
  const tooltip = useTooltip({ ids: { trigger: id } });
  const { keyDown, rest } = splitToolbarKeyDown(itemProps);
  const merged = mergeProps<ButtonProps>(
    label ? toolbarTooltipTriggerProps(tooltip.getTriggerProps()) : {},
    { "aria-label": label },
    rest,
    disabled ? withoutEventHandlers(props) : props,
    keyDown,
  );
  const button = <button {...merged} id={id} data-scope="toolbar" data-part={part} />;
  if (!label) return button;
  return (
    <>
      {button}
      <ArkTooltip.RootProvider value={tooltip}>
        <Portal>
          <Tooltip.Positioner>
            <Tooltip.Content>{toolbarTooltipText(label, shortcut)}</Tooltip.Content>
          </Tooltip.Positioner>
        </Portal>
      </ArkTooltip.RootProvider>
    </>
  );
}

/**
 * Toolbar.Button — one action. With a `label` and an icon as its child it is
 * an icon-only button, named by the label, which it shows as a tooltip.
 */
function ToolbarButton({ label, shortcut, disabled, ...props }: ToolbarButtonProps) {
  const api = useToolbar("Button");
  const itemProps = api.getButtonProps({ value: useId(), disabled });
  return (
    <ToolbarItem
      part="button"
      label={label}
      shortcut={shortcut}
      disabled={disabled}
      itemProps={itemProps}
      props={props}
    />
  );
}

/** Toolbar.Toggle — a button that stays pressed (`aria-pressed`), like bold. */
function ToolbarToggle({
  pressed,
  defaultPressed,
  onPressedChange,
  label,
  shortcut,
  disabled,
  ...props
}: ToolbarToggleProps) {
  const api = useToolbar("Toggle");
  const toggle = useToggle({ pressed, defaultPressed, onPressedChange });
  const itemProps = api.getToggleProps({ value: useId(), disabled, pressed: toggle.pressed });
  const press = () => toggle.setPressed(!toggle.pressed);
  return (
    <ToolbarItem
      part="toggle"
      label={label}
      shortcut={shortcut}
      disabled={disabled}
      itemProps={itemProps}
      props={mergeProps<ButtonProps>({ onClick: press }, props)}
    />
  );
}

/** Toolbar.Group — a run of related items, `role="group"`. Name it with `aria-label`. */
function ToolbarGroup(props: ToolbarGroupProps) {
  const api = useToolbar("Group");
  return <div {...mergeProps(api.getGroupProps(), props)} />;
}

/** Toolbar.Separator — a rule between groups, across the toolbar. */
function ToolbarSeparator(props: ToolbarSeparatorProps) {
  const api = useToolbar("Separator");
  return <div {...mergeProps(api.getSeparatorProps(), props)} />;
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
