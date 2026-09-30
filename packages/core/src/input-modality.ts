import { trackInteractionModality } from "@zag-js/focus-visible";

/**
 * Marks `<html>` with how the user last interacted — `data-input-modality`
 * set to `pointer`, `keyboard` or `virtual` (`@zag-js/focus-visible`) — so
 * CSS can keep a focus ring for the keyboard alone. Returns the cleanup; on
 * the server it does nothing.
 *
 * Needed where a component focuses its own part on a pointer press, as the
 * slider thumbs do: the browser counts that script focus as `:focus-visible`
 * and would draw the ring on a click. Every tracker writes the same global
 * value, so any number can run at once.
 */
export function trackInputModality(): () => void {
  if (typeof document === "undefined") return () => {};
  const html = document.documentElement;
  return trackInteractionModality({
    root: document,
    onChange({ modality }) {
      if (modality) html.dataset.inputModality = modality;
    },
  });
}
