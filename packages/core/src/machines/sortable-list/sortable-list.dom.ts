/**
 * Where SortableList meets the DOM: element ids and lookups, the boxes
 * measured when a move starts, and the scrolling that follows it. Only
 * actions, effects and event handlers call these, so nothing here runs on
 * the server.
 */
import type { Scope } from "@zag-js/core";
import type { ItemFocusPart, ItemLayout } from "./sortable-list.types.js";

export const getRootId = (scope: Scope): string => scope.ids?.root ?? `sortable-list:${scope.id}`;
export const getItemId = (scope: Scope, value: string): string =>
  scope.ids?.item?.(value) ?? `sortable-list:${scope.id}:item:${value}`;
export const getItemHandleId = (scope: Scope, value: string): string =>
  scope.ids?.itemHandle?.(value) ?? `sortable-list:${scope.id}:handle:${value}`;
export const getItemTriggerId = (scope: Scope, value: string): string =>
  scope.ids?.itemTrigger?.(value) ?? `sortable-list:${scope.id}:trigger:${value}`;

export const getRootEl = (scope: Scope) => scope.getById(getRootId(scope));
export const getItemEl = (scope: Scope, value: string) => scope.getById(getItemId(scope, value));
export const getItemHandleEl = (scope: Scope, value: string) =>
  scope.getById<HTMLButtonElement>(getItemHandleId(scope, value));
export const getItemTriggerEl = (scope: Scope, value: string) =>
  scope.getById(getItemTriggerId(scope, value));

/** Whether the item renders a handle: without one, the whole item drags. */
export const hasItemHandle = (scope: Scope, value: string): boolean =>
  getItemHandleEl(scope, value) != null;

/**
 * The element of an item that takes focus: the `part` asked for when the item
 * has it, otherwise whichever of the trigger and the handle it has. A disabled
 * handle can not take focus, so a disabled item is reached on its trigger.
 */
export function getItemFocusEl(scope: Scope, value: string, part: ItemFocusPart) {
  const handleEl = getItemHandleEl(scope, value);
  const handle = handleEl?.disabled ? null : handleEl;
  const trigger = getItemTriggerEl(scope, value);
  return part === "handle" ? (handle ?? trigger) : (trigger ?? handle);
}

/** Every item's box, in `items` order, relative to the top of the list. */
export function measureLayout(scope: Scope, items: readonly string[]): ItemLayout[] {
  const listTop = getListTop(scope);
  return items.map((value) => {
    const rect = getItemEl(scope, value)?.getBoundingClientRect();
    return { top: rect ? rect.top - listTop : 0, height: rect?.height ?? 0 };
  });
}

/**
 * Where the top of the list's content is in the viewport now. It moves when
 * the page or a box around the list scrolls, and when the list itself does.
 */
export function getListTop(scope: Scope): number {
  const root = getRootEl(scope);
  if (!root) return 0;
  return root.getBoundingClientRect().top - root.scrollTop;
}

const SCROLLABLE = /(auto|scroll|overlay)/;

/**
 * What scrolls the list: the nearest element from the list up whose content
 * overflows it on the vertical axis, else the page.
 */
export function getScrollContainer(scope: Scope): HTMLElement {
  const doc = scope.getDoc();
  const win = scope.getWin();
  let el: HTMLElement | null = getRootEl(scope);
  while (el && el !== doc.body && el !== doc.documentElement) {
    if (SCROLLABLE.test(win.getComputedStyle(el).overflowY) && el.scrollHeight > el.clientHeight) {
      return el;
    }
    el = el.parentElement;
  }
  return (doc.scrollingElement as HTMLElement | null) ?? doc.documentElement;
}

/** The part of the viewport a scroll container shows. */
export function getVisibleBounds(scope: Scope, container: HTMLElement) {
  const doc = scope.getDoc();
  if (container === doc.scrollingElement || container === doc.documentElement) {
    return { top: 0, bottom: scope.getWin().innerHeight };
  }
  const rect = container.getBoundingClientRect();
  return { top: rect.top, bottom: rect.bottom };
}

/** Scrolls `container` just enough to show a band of the viewport, from `top` to `bottom`. */
export function scrollBandIntoView(
  scope: Scope,
  container: HTMLElement,
  top: number,
  bottom: number,
): void {
  const visible = getVisibleBounds(scope, container);
  if (top < visible.top) container.scrollTop -= visible.top - top;
  else if (bottom > visible.bottom) container.scrollTop += bottom - visible.bottom;
}
