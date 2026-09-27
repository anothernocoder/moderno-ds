/**
 * The placement a Drawer.Root picked, read by its Positioner and Content:
 * Ark's Root renders no element to carry the recipe's attribute, so the Root
 * sets it in context and those two parts spread it. A getter, so a changed
 * `placement` prop follows.
 */
import { getContext, setContext } from "svelte";
import type { DrawerPlacement } from "@moderno-ui/core";

const DRAWER_PLACEMENT = Symbol("ModernoDrawerPlacement");

type PlacementGetter = () => DrawerPlacement | undefined;

export function setDrawerPlacement(placement: PlacementGetter): void {
  setContext(DRAWER_PLACEMENT, placement);
}

/** The enclosing Root's placement, or none (the recipe's default) outside one. */
export function getDrawerPlacement(): PlacementGetter {
  return getContext<PlacementGetter | undefined>(DRAWER_PLACEMENT) ?? (() => undefined);
}

/** Every part a Drawer renders is Ark's Dialog part under the "drawer" scope. */
export const DRAWER_SCOPE = { "data-scope": "drawer" } as const;
