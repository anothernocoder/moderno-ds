import { createLiveRegion } from "@zag-js/live-region";

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
 * Reads `message` to screen-reader users without moving focus, through a
 * visually hidden live region (`@zag-js/live-region`). Use it for changes a
 * sighted user sees but a screen reader would miss, such as an item moved in a
 * list. On the server it does nothing.
 *
 * Each call builds its region against the current `document.body`, so it keeps
 * working after a client-side router swaps `<body>`. Zag replaces its element
 * on every message, under one id, so the document never holds more than one.
 */
export function announce(message: string, { politeness = "polite" }: AnnounceOptions = {}): void {
  if (typeof document === "undefined") return;
  createLiveRegion({ level: politeness, document }).announce(message);
}
