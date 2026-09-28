/**
 * jsdom stand-ins for what the sortable-list machine reads from a real
 * browser, shared by the four frameworks' SortableList suites. jsdom lays
 * nothing out, so every box would be empty and no drag could find a slot.
 */
import { onTestFinished } from "vitest";

/** Each item's height in `stubListLayout`, in px. */
export const LIST_ITEM_HEIGHT = 32;
/** The distance from one item's top to the next one's in `stubListLayout`, in px. */
export const LIST_ITEM_STEP = 40;

/**
 * Lays every SortableList out as a browser would, until the test ends: the
 * list's top at 0, each item `LIST_ITEM_HEIGHT` tall, one below the other
 * every `LIST_ITEM_STEP`, in DOM order.
 */
export function stubListLayout(): void {
  const original = HTMLElement.prototype.getBoundingClientRect;
  HTMLElement.prototype.getBoundingClientRect = function (this: HTMLElement) {
    if (this.dataset.scope !== "sortable-list") return original.call(this);
    if (this.dataset.part === "item") {
      const siblings = [...(this.parentElement?.children ?? [])].filter(
        (el) => el instanceof HTMLElement && el.dataset.part === "item",
      );
      const top = siblings.indexOf(this) * LIST_ITEM_STEP;
      return DOMRect.fromRect({ x: 0, y: top, width: 200, height: LIST_ITEM_HEIGHT });
    }
    return DOMRect.fromRect({ x: 0, y: 0, width: 200, height: 400 });
  };
  onTestFinished(() => {
    HTMLElement.prototype.getBoundingClientRect = original;
  });
}

/**
 * Dispatches a pointer event at `y`. jsdom has no PointerEvent: a MouseEvent
 * of the pointer type carries the button and the coordinates, and the
 * pointer's id is set on it.
 */
export function dispatchPointer(
  type: "pointerdown" | "pointermove" | "pointerup" | "pointercancel",
  target: EventTarget,
  { y, pointerId = 1 }: { y: number; pointerId?: number },
): void {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    button: 0,
    buttons: type === "pointerup" ? 0 : 1,
    clientX: 10,
    clientY: y,
  });
  Object.defineProperty(event, "pointerId", { value: pointerId });
  target.dispatchEvent(event);
}

/** What the shared live region last said, from `announce()`. */
export function liveRegionText(): string | undefined {
  return document.querySelector("[data-live-announcer]")?.textContent ?? undefined;
}
