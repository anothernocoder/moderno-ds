import { Popover as ArkPopover } from "@ark-ui/svelte";
import PopoverRoot from "../PopoverRoot.svelte";
import PopoverContent from "../PopoverContent.svelte";

/**
 * Popover — a non-modal surface anchored to its trigger, with an optional
 * arrow, title, description and close button. Ark places the content beside
 * the trigger, wires `aria-expanded` / `aria-controls` on the trigger and
 * `aria-labelledby` / `aria-describedby` on the `role="dialog"` content,
 * moves focus in on open and back on close, and closes on Escape or a click
 * outside. `Root` takes the `size` recipe and `Content` carries it; every
 * other part is Ark's verbatim. Annotated so the emitted `.d.ts` doesn't
 * inline an un-nameable `@zag-js` type (TS2742).
 */
export const Popover: Omit<typeof ArkPopover, "Root" | "Content"> & {
  Root: typeof PopoverRoot;
  Content: typeof PopoverContent;
} = {
  ...ArkPopover,
  Root: PopoverRoot,
  Content: PopoverContent,
};
export type { PopoverSize } from "@moderno-ui/core";
export type { PopoverOpenChangeDetails } from "@ark-ui/svelte";
