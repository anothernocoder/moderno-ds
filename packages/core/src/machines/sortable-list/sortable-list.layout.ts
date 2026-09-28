/**
 * The arithmetic of a move, with no DOM: where the moved item lands and how
 * far each item is drawn from its place while it moves. Every box is the one
 * measured when the move started, relative to the top of the list, so a
 * scroll during the move changes nothing here.
 */
import type { ItemLayout } from "./sortable-list.types.js";

/** `items` with the one at `from` taken out and put back at `to`. */
export function moveItem<T>(items: readonly T[], from: number, to: number): T[] {
  const next = items.slice();
  const [moved] = next.splice(from, 1);
  if (moved !== undefined) next.splice(to, 0, moved);
  return next;
}

/** The space between two items, read from the first two. */
function itemGap(layout: readonly ItemLayout[]): number {
  const [first, second] = layout;
  if (!first || !second) return 0;
  return second.top - (first.top + first.height);
}

const bottomOf = (box: ItemLayout) => box.top + box.height;

/**
 * How far the moved item is drawn from its place to sit in slot `to`: its
 * top meets that slot's top going up, its bottom meets that slot's bottom
 * going down.
 */
export function slotOffset(layout: readonly ItemLayout[], from: number, to: number): number {
  const start = layout[from];
  const slot = layout[to];
  if (!start || !slot || from === to) return 0;
  return to > from ? bottomOf(slot) - bottomOf(start) : slot.top - start.top;
}

/**
 * How far the item at `index` steps aside while the one at `from` would land
 * at `to`: the items it passes shift by its height and one gap, away from
 * where it goes.
 */
export function shiftOffset(
  layout: readonly ItemLayout[],
  from: number,
  to: number,
  index: number,
): number {
  const moved = layout[from];
  if (!moved || index === from) return 0;
  const room = moved.height + itemGap(layout);
  if (from < index && index <= to) return -room;
  if (to <= index && index < from) return room;
  return 0;
}

/** A pointer's offset kept inside the list: the item never leaves its first or last slot. */
export function clampDragOffset(
  layout: readonly ItemLayout[],
  from: number,
  offset: number,
): number {
  const moved = layout[from];
  const first = layout[0];
  const last = layout[layout.length - 1];
  if (!moved || !first || !last) return 0;
  const min = first.top - moved.top;
  const max = bottomOf(last) - bottomOf(moved);
  return Math.min(max, Math.max(min, offset));
}

/**
 * The slot the item at `from`, drawn `offset` from its place, would land in:
 * the number of other items its middle has reached. Reaching a middle counts
 * as passing it, so an item held against the first or last slot lands there.
 */
export function dropIndexAt(layout: readonly ItemLayout[], from: number, offset: number): number {
  const moved = layout[from];
  if (!moved) return from;
  const middle = moved.top + moved.height / 2 + offset;
  return layout.filter((box, index) => {
    const boxMiddle = box.top + box.height / 2;
    if (index < from) return boxMiddle < middle;
    return index > from && boxMiddle <= middle;
  }).length;
}

/** How close to an edge, in pixels at most, a dragged pointer starts scrolling. */
const AUTO_SCROLL_EDGE = 48;
/** The fastest the list scrolls, in pixels per frame, with the pointer on the edge. */
const AUTO_SCROLL_MAX_SPEED = 16;

/**
 * How far to scroll this frame for a pointer at `y` in a container showing
 * `bounds`: negative near the top edge, positive near the bottom, faster
 * closer to the edge, and 0 in between. The edge zone is a quarter of a small
 * container, so its middle never scrolls.
 */
export function autoScrollSpeed(y: number, bounds: { top: number; bottom: number }): number {
  const zone = Math.min(AUTO_SCROLL_EDGE, (bounds.bottom - bounds.top) / 4);
  if (zone <= 0) return 0;
  const intoTop = bounds.top + zone - y;
  const intoBottom = y - (bounds.bottom - zone);
  if (intoTop > 0) return -Math.round(AUTO_SCROLL_MAX_SPEED * Math.min(1, intoTop / zone));
  if (intoBottom > 0) return Math.round(AUTO_SCROLL_MAX_SPEED * Math.min(1, intoBottom / zone));
  return 0;
}
