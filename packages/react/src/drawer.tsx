import {
  createContext,
  createElement,
  useContext,
  type ComponentProps,
  type ComponentType,
  type ReactElement,
} from "react";
import { Dialog as ArkDialog } from "@ark-ui/react";
import type {
  DialogBackdropProps,
  DialogCloseTriggerProps,
  DialogContentProps,
  DialogDescriptionProps,
  DialogOpenChangeDetails,
  DialogPositionerProps,
  DialogRootProps,
  DialogRootProviderProps,
  DialogTitleProps,
  DialogTriggerProps,
} from "@ark-ui/react";
import { drawerRecipe, type DrawerPlacement } from "@moderno-ui/core";

export type { DrawerPlacement } from "@moderno-ui/core";

/** The edge a Drawer slides in from, on top of Ark's Dialog root props. */
export interface DrawerRootProps extends DialogRootProps {
  /** The viewport edge the panel slides in from — `data-placement` on the positioner and content. */
  placement?: DrawerPlacement;
}

/** The same, for a Drawer driven by `useDialog()`. */
export interface DrawerRootProviderProps extends DialogRootProviderProps {
  /** The viewport edge the panel slides in from — `data-placement` on the positioner and content. */
  placement?: DrawerPlacement;
}

export type DrawerTriggerProps = DialogTriggerProps;
export type DrawerBackdropProps = DialogBackdropProps;
export type DrawerPositionerProps = DialogPositionerProps;
export type DrawerContentProps = DialogContentProps;
export type DrawerTitleProps = DialogTitleProps;
export type DrawerDescriptionProps = DialogDescriptionProps;
export type DrawerCloseTriggerProps = DialogCloseTriggerProps;
export type DrawerOpenChangeDetails = DialogOpenChangeDetails;

/** Every part a Drawer renders is Ark's Dialog part under the "drawer" scope. */
const DRAWER_SCOPE = { "data-scope": "drawer" } as const;

/** The placement a Root picked, read by its Positioner and Content: Ark's Root renders no element. */
const DrawerPlacementContext = createContext<DrawerPlacement | undefined>(undefined);

/** Ark's Dialog part, rendered under the "drawer" scope; its props (and ref) pass through. */
function inDrawerScope<P extends object>(Part: ComponentType<P>): (props: P) => ReactElement {
  return function DrawerPart(props: P) {
    return createElement(Part, { ...props, ...DRAWER_SCOPE });
  };
}

/** Ark's Dialog part under the "drawer" scope, with the Root's placement from the recipe. */
function placedInDrawerScope<P extends object>(Part: ComponentType<P>): (props: P) => ReactElement {
  return function PlacedDrawerPart(props: P) {
    const placement = useContext(DrawerPlacementContext);
    return createElement(Part, { ...props, ...DRAWER_SCOPE, ...drawerRecipe({ placement }) });
  };
}

/** Dialog.Root with the Moderno `placement` recipe: it hands the placement to its parts. */
function DrawerRoot({ placement, ...props }: DrawerRootProps) {
  return (
    <DrawerPlacementContext.Provider value={placement}>
      <ArkDialog.Root {...props} />
    </DrawerPlacementContext.Provider>
  );
}

/** Dialog.RootProvider with the same `placement` recipe. */
function DrawerRootProvider({ placement, ...props }: DrawerRootProviderProps) {
  return (
    <DrawerPlacementContext.Provider value={placement}>
      <ArkDialog.RootProvider {...props} />
    </DrawerPlacementContext.Provider>
  );
}

/**
 * Drawer — a modal panel that slides in from one edge of the viewport: a
 * side panel of filters or settings, a navigation menu, a bottom sheet of
 * actions.
 *
 * It is Ark's Dialog with Ark's anatomy and part names: Ark traps focus,
 * restores it on close, locks scroll, closes on Escape or a click outside,
 * and wires `aria-labelledby` / `aria-describedby` with ids from `useId`.
 * `Root > Trigger + Portal(> Backdrop + Positioner > Content > Title,
 * Description, CloseTrigger)`. Every part renders under the "drawer" scope,
 * so `components.css` styles it apart from a Dialog; `Root` takes the
 * `placement` recipe and the Positioner and Content carry it. `Context` is
 * Ark's verbatim. The object is annotated so the emitted `.d.ts` doesn't
 * inline an un-nameable `@zag-js` type (TS2742).
 */
export const Drawer: {
  Root: typeof DrawerRoot;
  RootProvider: typeof DrawerRootProvider;
  Trigger: (props: ComponentProps<typeof ArkDialog.Trigger>) => ReactElement;
  Backdrop: (props: ComponentProps<typeof ArkDialog.Backdrop>) => ReactElement;
  Positioner: (props: ComponentProps<typeof ArkDialog.Positioner>) => ReactElement;
  Content: (props: ComponentProps<typeof ArkDialog.Content>) => ReactElement;
  Title: (props: ComponentProps<typeof ArkDialog.Title>) => ReactElement;
  Description: (props: ComponentProps<typeof ArkDialog.Description>) => ReactElement;
  CloseTrigger: (props: ComponentProps<typeof ArkDialog.CloseTrigger>) => ReactElement;
  Context: typeof ArkDialog.Context;
} = {
  Root: DrawerRoot,
  RootProvider: DrawerRootProvider,
  Trigger: inDrawerScope(ArkDialog.Trigger),
  Backdrop: inDrawerScope(ArkDialog.Backdrop),
  Positioner: placedInDrawerScope(ArkDialog.Positioner),
  Content: placedInDrawerScope(ArkDialog.Content),
  Title: inDrawerScope(ArkDialog.Title),
  Description: inDrawerScope(ArkDialog.Description),
  CloseTrigger: inDrawerScope(ArkDialog.CloseTrigger),
  Context: ArkDialog.Context,
};
