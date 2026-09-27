import { createLiveRegion, type LiveRegion } from "@zag-js/live-region";

/** How urgently a screen reader reads an announcement. */
export type AnnouncePoliteness = "polite" | "assertive";

export interface AnnounceOptions {
  /**
   * `polite` (the default) waits until the screen reader is idle;
   * `assertive` interrupts it. Keep `assertive` for errors.
   */
  politeness?: AnnouncePoliteness;
}

/**
 * The live regions of each document, one per politeness, created on first
 * use. Zag's live region replaces its element on every message, under one id,
 * so the document never holds more than one.
 */
const liveRegions = new WeakMap<Document, Partial<Record<AnnouncePoliteness, LiveRegion>>>();

function liveRegionFor(document: Document, politeness: AnnouncePoliteness): LiveRegion {
  const regions = liveRegions.get(document) ?? {};
  liveRegions.set(document, regions);
  return (regions[politeness] ??= createLiveRegion({ level: politeness, document }));
}

/**
 * Reads `message` to screen-reader users without moving focus, through a
 * visually hidden live region (`@zag-js/live-region`). Use it for changes a
 * sighted user sees but a screen reader would miss, such as an item moved in a
 * list. On the server it does nothing.
 */
export function announce(message: string, { politeness = "polite" }: AnnounceOptions = {}): void {
  if (typeof document === "undefined") return;
  liveRegionFor(document, politeness).announce(message);
}
