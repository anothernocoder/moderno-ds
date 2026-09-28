/**
 * Toolbar's prop types and the context its Root hands to the items, in a
 * `.ts` file rather than inside the `.svelte`s, for the same reason as
 * `callout-props.ts`: a `Props` interface declared inside a component's
 * instance script is not exported, so `index.ts` could not re-export it.
 */
import { getContext, setContext, type Snippet } from "svelte";
import type { HTMLAttributes, HTMLButtonAttributes } from "svelte/elements";
import type { PropTypes } from "@zag-js/svelte";
import type { toolbar, ToolbarSize } from "@moderno-ui/core";

/** The axis a toolbar's items run along. */
export type ToolbarOrientation = toolbar.Orientation;

export interface ToolbarRootProps extends Omit<HTMLAttributes<HTMLDivElement>, "dir"> {
  /** Lays the items out in a row (Left/Right arrows) or a column (Up/Down). Default `"horizontal"`. */
  orientation?: ToolbarOrientation;
  /** Height of every item: Button's sizes. Default `"md"`. */
  size?: ToolbarSize;
  /** Text direction. In `rtl` the Left and Right arrows swap. */
  dir?: "ltr" | "rtl";
  children?: Snippet;
}

interface ToolbarItemOwnProps {
  /** Names an icon-only item: its `aria-label`, and the text of its tooltip. */
  label?: string;
  /** A keyboard shortcut the tooltip shows in parentheses after the label. */
  shortcut?: string;
  /** Keeps the item in the arrow-key order, announced as disabled, but it does nothing. */
  disabled?: boolean;
  children?: Snippet;
}

export interface ToolbarButtonProps
  extends Omit<HTMLButtonAttributes, "disabled" | "children">, ToolbarItemOwnProps {}

export interface ToolbarToggleProps
  extends Omit<HTMLButtonAttributes, "disabled" | "children">, ToolbarItemOwnProps {
  /** Pressed state; bindable with `bind:pressed`. */
  pressed?: boolean;
  /** Initial pressed state when uncontrolled. Default `false`. */
  defaultPressed?: boolean;
  /** Called with the new pressed state when the toggle is pressed. */
  onPressedChange?: (pressed: boolean) => void;
}

export interface ToolbarGroupProps extends HTMLAttributes<HTMLDivElement> {
  children?: Snippet;
}

export type ToolbarSeparatorProps = HTMLAttributes<HTMLDivElement>;

type ToolbarApi = toolbar.Api<PropTypes>;

const TOOLBAR = Symbol("ModernoToolbar");

/** Called by Toolbar.Root: its items read the connected machine from `api`. */
export function provideToolbar(api: () => ToolbarApi): void {
  setContext(TOOLBAR, api);
}

/** Called by every part inside a Toolbar.Root: the connected machine, as a getter. */
export function useToolbar(part: string): () => ToolbarApi {
  const api = getContext<(() => ToolbarApi) | undefined>(TOOLBAR);
  if (!api) throw new Error(`Toolbar.${part} must be inside a Toolbar.Root.`);
  return api;
}
