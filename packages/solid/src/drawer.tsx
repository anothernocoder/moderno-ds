import { createContext, mergeProps, splitProps, useContext, type Component } from "solid-js";
import { Dialog as ArkDialog } from "@ark-ui/solid";
import type { DialogRootProps, DialogRootProviderProps } from "@ark-ui/solid";
import { drawerRecipe, type DrawerPlacement } from "@moderno-ui/core";

export type { DrawerPlacement } from "@moderno-ui/core";

/** The edge a Drawer slides in from, on top of Ark's Dialog root props. */
export type DrawerRootProps = DialogRootProps & {
  /** The viewport edge the panel slides in from — `data-placement` on the positioner and content. */
  placement?: DrawerPlacement;
};

/** The same, for a Drawer driven by `useDialog()`. */
export type DrawerRootProviderProps = DialogRootProviderProps & {
  /** The viewport edge the panel slides in from — `data-placement` on the positioner and content. */
  placement?: DrawerPlacement;
};

export type {
  DialogTriggerProps as DrawerTriggerProps,
  DialogBackdropProps as DrawerBackdropProps,
  DialogPositionerProps as DrawerPositionerProps,
  DialogContentProps as DrawerContentProps,
  DialogTitleProps as DrawerTitleProps,
  DialogDescriptionProps as DrawerDescriptionProps,
  DialogCloseTriggerProps as DrawerCloseTriggerProps,
  DialogOpenChangeDetails as DrawerOpenChangeDetails,
} from "@ark-ui/solid";

/** Every part a Drawer renders is Ark's Dialog part under the "drawer" scope. */
const DRAWER_SCOPE = { "data-scope": "drawer" } as const;

/** The placement a Root picked, read by its Positioner and Content: Ark's Root renders no element. */
const DrawerPlacementContext = createContext<() => DrawerPlacement | undefined>(() => undefined);

/** Ark's Dialog part, rendered under the "drawer" scope; its props pass through. */
function inDrawerScope<P extends object>(Part: Component<P>): Component<P> {
  // Ark's part props accept any data-* attribute; the generic P can't show it.
  return (props) => <Part {...(mergeProps(props, DRAWER_SCOPE) as P)} />;
}

/** Ark's Dialog part under the "drawer" scope, with the Root's placement from the recipe. */
function placedInDrawerScope<P extends object>(Part: Component<P>): Component<P> {
  return (props) => {
    const placement = useContext(DrawerPlacementContext);
    const merged = mergeProps(props, DRAWER_SCOPE, () => drawerRecipe({ placement: placement() }));
    return <Part {...(merged as P)} />;
  };
}

/** Dialog.Root with the Moderno `placement` recipe: it hands the placement to its parts. */
function DrawerRoot(props: DrawerRootProps) {
  const [local, rest] = splitProps(props, ["placement"]);
  return (
    <DrawerPlacementContext.Provider value={() => local.placement}>
      <ArkDialog.Root {...rest} />
    </DrawerPlacementContext.Provider>
  );
}

/** Dialog.RootProvider with the same `placement` recipe. */
function DrawerRootProvider(props: DrawerRootProviderProps) {
  const [local, rest] = splitProps(props, ["placement"]);
  return (
    <DrawerPlacementContext.Provider value={() => local.placement}>
      <ArkDialog.RootProvider {...rest} />
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
 * and wires `aria-labelledby` / `aria-describedby` with deterministic ids.
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
  Trigger: typeof ArkDialog.Trigger;
  Backdrop: typeof ArkDialog.Backdrop;
  Positioner: typeof ArkDialog.Positioner;
  Content: typeof ArkDialog.Content;
  Title: typeof ArkDialog.Title;
  Description: typeof ArkDialog.Description;
  CloseTrigger: typeof ArkDialog.CloseTrigger;
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
