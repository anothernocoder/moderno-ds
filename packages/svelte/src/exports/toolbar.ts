import ToolbarRoot from "../ToolbarRoot.svelte";
import ToolbarButton from "../ToolbarButton.svelte";
import ToolbarToggle from "../ToolbarToggle.svelte";
import ToolbarGroup from "../ToolbarGroup.svelte";
import ToolbarSeparator from "../ToolbarSeparator.svelte";

/**
 * Toolbar — a bar of buttons, toggles, groups and separators, like the top
 * bar of an editor (undo, redo, zoom, theme). The toolbar machine from
 * `@moderno-ui/core` drives the keyboard: the whole bar is one Tab stop, the
 * arrow keys move between items (Left/Right in a row, Up/Down in a column),
 * Home and End go to the ends. A disabled item stays in that order but does
 * nothing. An item with a `label` is icon-only: the label names it and shows
 * in a tooltip, with its `shortcut`. A `Menu.Trigger` whose `asChild`
 * snippet renders a `Toolbar.Button` makes it a menu button. Anatomy:
 * `Root > Button + Toggle + Group > … + Separator`.
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
export type { ToolbarSize } from "@moderno-ui/core";
export type {
  ToolbarOrientation,
  ToolbarRootProps,
  ToolbarButtonProps,
  ToolbarToggleProps,
  ToolbarGroupProps,
  ToolbarSeparatorProps,
} from "../toolbar-props.js";
