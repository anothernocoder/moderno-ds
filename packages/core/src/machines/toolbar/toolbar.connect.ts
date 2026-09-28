import { dataAttr, getEventKey } from "@zag-js/dom-query";
import type { JSX, NormalizeProps, PropTypes } from "@zag-js/types";
import { parts } from "./toolbar.anatomy.js";
import * as dom from "./toolbar.dom.js";
import type { ItemProps, ToolbarApi, ToolbarOrientation, ToolbarService } from "./toolbar.types.js";

/** The event each navigation key sends, for a toolbar laid out along `orientation`. */
function navigationEvents(orientation: ToolbarOrientation): Record<string, string> {
  const horizontal = orientation === "horizontal";
  return {
    [horizontal ? "ArrowRight" : "ArrowDown"]: "ITEM.FOCUS_NEXT",
    [horizontal ? "ArrowLeft" : "ArrowUp"]: "ITEM.FOCUS_PREV",
    Home: "ITEM.FOCUS_FIRST",
    End: "ITEM.FOCUS_LAST",
  };
}

export function connect<T extends PropTypes>(
  service: ToolbarService,
  normalize: NormalizeProps<T>,
): ToolbarApi<T> {
  const { context, send, prop, scope } = service;
  const orientation = prop("orientation");
  // A framework store may hand back `undefined` for the unset `null`.
  const activeValue = context.get("activeValue") ?? null;
  const rootId = dom.getRootId(scope);
  const events = navigationEvents(orientation);

  /** What every item shares: its place in the arrow-key order and the one Tab stop. */
  function itemAttrs({ value, disabled }: ItemProps) {
    return {
      type: "button" as const,
      "data-ownedby": rootId,
      "data-value": value,
      "data-orientation": orientation,
      "data-disabled": dataAttr(disabled),
      "aria-disabled": disabled || undefined,
      // Until the machine has found the first item (on the server, before
      // hydration) every item is a Tab stop, so none is out of reach.
      tabIndex: activeValue === null || activeValue === value ? 0 : -1,
      onFocus() {
        send({ type: "ITEM.FOCUS", value });
      },
      onKeyDown(event: JSX.KeyboardEvent<HTMLButtonElement>) {
        // Something merged into the item claimed the key first (a Menu.Trigger
        // opens on ArrowDown, even in a vertical toolbar).
        if (event.defaultPrevented) return;
        const type = events[getEventKey(event, { dir: prop("dir"), orientation })];
        if (!type) return;
        event.preventDefault();
        send({ type });
      },
    };
  }

  return {
    orientation,
    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        id: rootId,
        dir: prop("dir"),
        role: "toolbar",
        "aria-orientation": orientation,
        "data-orientation": orientation,
      });
    },
    getButtonProps(props) {
      return normalize.button({ ...parts.button.attrs, ...itemAttrs(props) });
    },
    getToggleProps({ pressed, ...props }) {
      return normalize.button({
        ...parts.toggle.attrs,
        ...itemAttrs(props),
        "aria-pressed": pressed,
        "data-state": pressed ? "on" : "off",
        "data-pressed": dataAttr(pressed),
      });
    },
    getGroupProps() {
      return normalize.element({
        ...parts.group.attrs,
        role: "group",
        "data-orientation": orientation,
      });
    },
    getSeparatorProps() {
      // The rule runs across the toolbar: upright in a row, flat in a column.
      const across = orientation === "horizontal" ? "vertical" : "horizontal";
      return normalize.element({
        ...parts.separator.attrs,
        role: "separator",
        "aria-orientation": across,
        "data-orientation": across,
      });
    },
  };
}
