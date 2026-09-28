import type { Scope } from "@zag-js/core";

/** The root's id: the one the binding sets, or one derived from the machine's. */
export const getRootId = (scope: Scope): string => scope.ids?.root ?? `toolbar:${scope.id}`;

export const getRootEl = (scope: Scope): HTMLElement | null => scope.getById(getRootId(scope));

/**
 * Every item of this toolbar, in document order. Items point back to their
 * root with `data-ownedby`, so a toolbar nested in another one keeps its own.
 * Disabled items are kept: they stay in the arrow-key order.
 */
export function getItemEls(scope: Scope): HTMLElement[] {
  const root = getRootEl(scope);
  if (!root) return [];
  const owner = CSS.escape(getRootId(scope));
  return Array.from(root.querySelectorAll<HTMLElement>(`[data-ownedby="${owner}"]`));
}

/** The value an item element was rendered with. */
export const getItemValue = (el: HTMLElement | undefined): string | null =>
  el?.getAttribute("data-value") ?? null;
