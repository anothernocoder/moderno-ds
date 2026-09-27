import { Dialog as ArkDialog } from "@ark-ui/svelte";
import DrawerRoot from "../DrawerRoot.svelte";
import DrawerRootProvider from "../DrawerRootProvider.svelte";
import DrawerTrigger from "../DrawerTrigger.svelte";
import DrawerBackdrop from "../DrawerBackdrop.svelte";
import DrawerPositioner from "../DrawerPositioner.svelte";
import DrawerContent from "../DrawerContent.svelte";
import DrawerTitle from "../DrawerTitle.svelte";
import DrawerDescription from "../DrawerDescription.svelte";
import DrawerCloseTrigger from "../DrawerCloseTrigger.svelte";

/**
 * Drawer — a modal panel that slides in from one edge of the viewport: a
 * side panel of filters or settings, a navigation menu, a bottom sheet of
 * actions.
 *
 * It is Ark's Dialog with Ark's anatomy and part names: Ark traps focus,
 * restores it on close, locks scroll, closes on Escape or a click outside,
 * and wires `aria-labelledby` / `aria-describedby`. `Root > Trigger +
 * Portal(> Backdrop + Positioner > Content > Title, Description,
 * CloseTrigger)`. Every part renders under the "drawer" scope, so
 * `components.css` styles it apart from a Dialog; `Root` takes the
 * `placement` recipe and the Positioner and Content carry it. `Context` is
 * Ark's verbatim. Annotated so the emitted `.d.ts` doesn't inline an
 * un-nameable `@zag-js` type (TS2742).
 */
export const Drawer: {
  Root: typeof DrawerRoot;
  RootProvider: typeof DrawerRootProvider;
  Trigger: typeof DrawerTrigger;
  Backdrop: typeof DrawerBackdrop;
  Positioner: typeof DrawerPositioner;
  Content: typeof DrawerContent;
  Title: typeof DrawerTitle;
  Description: typeof DrawerDescription;
  CloseTrigger: typeof DrawerCloseTrigger;
  Context: typeof ArkDialog.Context;
} = {
  Root: DrawerRoot,
  RootProvider: DrawerRootProvider,
  Trigger: DrawerTrigger,
  Backdrop: DrawerBackdrop,
  Positioner: DrawerPositioner,
  Content: DrawerContent,
  Title: DrawerTitle,
  Description: DrawerDescription,
  CloseTrigger: DrawerCloseTrigger,
  Context: ArkDialog.Context,
};
export type { DrawerPlacement } from "@moderno-ui/core";
export type { DialogOpenChangeDetails as DrawerOpenChangeDetails } from "@ark-ui/svelte";
