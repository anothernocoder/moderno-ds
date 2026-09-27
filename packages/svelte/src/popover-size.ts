/**
 * The size a Popover.Root picked, read by its Content: Ark's Root renders no
 * element to carry the recipe's attribute, so the Root sets it in context
 * and the Content spreads it. A getter, so a changed `size` prop follows.
 */
import { getContext, setContext } from "svelte";
import type { PopoverSize } from "@moderno-ui/core";

const POPOVER_SIZE = Symbol("ModernoPopoverSize");

type SizeGetter = () => PopoverSize | undefined;

export function setPopoverSize(size: SizeGetter): void {
  setContext(POPOVER_SIZE, size);
}

/** The enclosing Root's size, or none (the recipe's default) outside one. */
export function getPopoverSize(): SizeGetter {
  return getContext<SizeGetter | undefined>(POPOVER_SIZE) ?? (() => undefined);
}
