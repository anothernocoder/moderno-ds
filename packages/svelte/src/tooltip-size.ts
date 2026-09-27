/**
 * The size a Tooltip.Root hands down to its Content. Ark's Root renders no
 * element, so the recipe's `data-size` lands on the content, the surface; the
 * size travels there through Svelte context, read as a getter so a change on
 * the root follows.
 */
import { getContext, setContext } from "svelte";
import type { TooltipSize } from "@moderno-ui/core";

const TOOLTIP_SIZE = Symbol("ModernoTooltipSize");

type SizeGetter = () => TooltipSize | undefined;

/** Called by Tooltip.Root: its descendants read the size from `size`. */
export function provideTooltipSize(size: SizeGetter): void {
  setContext(TOOLTIP_SIZE, size);
}

/** Called by Tooltip.Content: the size of the Root around it, if any. */
export function useTooltipSize(): SizeGetter {
  return getContext<SizeGetter | undefined>(TOOLTIP_SIZE) ?? (() => undefined);
}
