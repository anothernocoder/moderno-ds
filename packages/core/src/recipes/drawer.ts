import { cva, type VariantProps } from "../cva.js";

/**
 * Drawer: `placement` on the root — the viewport edge the panel slides in
 * from. Ark's Dialog.Root renders no element, so the bindings hand the
 * placement from the root to the positioner (which pins the panel to that
 * edge) and the content (which draws its inner edge and slides from it).
 * Open state and focus are Ark's own props and surface as `data-state`.
 */
export const drawerRecipe = cva({
  variants: {
    placement: ["left", "right", "top", "bottom"],
  },
  defaultVariants: { placement: "right" },
});

/** The viewport edge a Drawer slides in from. */
export type DrawerPlacement = NonNullable<VariantProps<typeof drawerRecipe.variants>["placement"]>;
