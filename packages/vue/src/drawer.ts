import {
  defineComponent,
  h,
  inject,
  provide,
  type Component,
  type DefineComponent,
  type InjectionKey,
  type PropType,
} from "vue";
import { Dialog as ArkDialog } from "@ark-ui/vue";
import type {
  DialogFocusOutsideEvent,
  DialogInteractOutsideEvent,
  DialogOpenChangeDetails,
  DialogPointerDownOutsideEvent,
  DialogRootProps,
  DialogRootProviderProps,
} from "@ark-ui/vue";
import { drawerRecipe, type DrawerPlacement } from "@moderno-ui/core";

export type { DrawerPlacement } from "@moderno-ui/core";

/**
 * The Root's public surface: Ark's Dialog props plus the Moderno `placement`
 * recipe. Ark-Vue declares the callbacks as emits rather than props, so they
 * are spelled out here — a `h()` caller (and a template) passes them as
 * `onOpenChange` / `onUpdate:open` handlers, and `inheritAttrs: false`
 * forwards them untouched.
 */
export interface DrawerRootProps extends DialogRootProps {
  /** The viewport edge the panel slides in from — `data-placement` on the positioner and content. */
  placement?: DrawerPlacement;
  onOpenChange?: (details: DialogOpenChangeDetails) => void;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onFocusOutside?: (event: DialogFocusOutsideEvent) => void;
  onInteractOutside?: (event: DialogInteractOutsideEvent) => void;
  onPointerDownOutside?: (event: DialogPointerDownOutsideEvent) => void;
  onExitComplete?: () => void;
  "onUpdate:open"?: (open: boolean) => void;
}

/** The same, for a Drawer driven by `useDialog()`. */
export interface DrawerRootProviderProps extends DialogRootProviderProps {
  /** The viewport edge the panel slides in from — `data-placement` on the positioner and content. */
  placement?: DrawerPlacement;
}

export type {
  DialogTriggerProps as DrawerTriggerProps,
  DialogBackdropProps as DrawerBackdropProps,
  DialogPositionerProps as DrawerPositionerProps,
  DialogContentProps as DrawerContentProps,
  DialogTitleProps as DrawerTitleProps,
  DialogDescriptionProps as DrawerDescriptionProps,
  DialogCloseTriggerProps as DrawerCloseTriggerProps,
  DialogOpenChangeDetails as DrawerOpenChangeDetails,
} from "@ark-ui/vue";

/** Every part a Drawer renders is Ark's Dialog part under the "drawer" scope. */
const DRAWER_SCOPE = { "data-scope": "drawer" } as const;

/** The placement a Root picked, read by its Positioner and Content: Ark's Root renders no element. */
const DRAWER_PLACEMENT: InjectionKey<() => DrawerPlacement | undefined> =
  Symbol("ModernoDrawerPlacement");

/** A Root (or RootProvider) that provides its `placement` and hands every other attr to Ark's. */
function withPlacement(ArkRoot: unknown, name: string) {
  // Ark's Root re-typed as a plain Component so the attrs bag isn't checked
  // against its full prop union.
  const Root = ArkRoot as Component;
  return defineComponent({
    name,
    inheritAttrs: false,
    props: {
      placement: { type: String as PropType<DrawerPlacement>, default: undefined },
    },
    setup(props, { slots, attrs }) {
      provide(DRAWER_PLACEMENT, () => props.placement);
      return () => h(Root, attrs, slots);
    },
  });
}

/** Ark's Dialog part, rendered under the "drawer" scope; its props and attrs pass through. */
function inDrawerScope(ArkPart: unknown, name: string) {
  const Part = ArkPart as Component;
  return defineComponent({
    name,
    inheritAttrs: false,
    setup(_, { slots, attrs }) {
      return () => h(Part, { ...attrs, ...DRAWER_SCOPE }, slots);
    },
  });
}

/** Ark's Dialog part under the "drawer" scope, with the Root's placement from the recipe. */
function placedInDrawerScope(ArkPart: unknown, name: string) {
  const Part = ArkPart as Component;
  return defineComponent({
    name,
    inheritAttrs: false,
    setup(_, { slots, attrs }) {
      const placement = inject(DRAWER_PLACEMENT, () => undefined);
      return () =>
        h(Part, { ...attrs, ...DRAWER_SCOPE, ...drawerRecipe({ placement: placement() }) }, slots);
    },
  });
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
 * Ark's verbatim.
 *
 * The whole object is annotated explicitly so the emitted `.d.ts` doesn't
 * inline an un-nameable type that points at internal `@zag-js` paths (TS2742).
 */
export const Drawer: {
  Root: DefineComponent<DrawerRootProps>;
  RootProvider: DefineComponent<DrawerRootProviderProps>;
  Trigger: typeof ArkDialog.Trigger;
  Backdrop: typeof ArkDialog.Backdrop;
  Positioner: typeof ArkDialog.Positioner;
  Content: typeof ArkDialog.Content;
  Title: typeof ArkDialog.Title;
  Description: typeof ArkDialog.Description;
  CloseTrigger: typeof ArkDialog.CloseTrigger;
  Context: typeof ArkDialog.Context;
} = {
  Root: withPlacement(
    ArkDialog.Root,
    "ModernoDrawerRoot",
  ) as unknown as DefineComponent<DrawerRootProps>,
  RootProvider: withPlacement(
    ArkDialog.RootProvider,
    "ModernoDrawerRootProvider",
  ) as unknown as DefineComponent<DrawerRootProviderProps>,
  Trigger: inDrawerScope(
    ArkDialog.Trigger,
    "ModernoDrawerTrigger",
  ) as unknown as typeof ArkDialog.Trigger,
  Backdrop: inDrawerScope(
    ArkDialog.Backdrop,
    "ModernoDrawerBackdrop",
  ) as unknown as typeof ArkDialog.Backdrop,
  Positioner: placedInDrawerScope(
    ArkDialog.Positioner,
    "ModernoDrawerPositioner",
  ) as unknown as typeof ArkDialog.Positioner,
  Content: placedInDrawerScope(
    ArkDialog.Content,
    "ModernoDrawerContent",
  ) as unknown as typeof ArkDialog.Content,
  Title: inDrawerScope(ArkDialog.Title, "ModernoDrawerTitle") as unknown as typeof ArkDialog.Title,
  Description: inDrawerScope(
    ArkDialog.Description,
    "ModernoDrawerDescription",
  ) as unknown as typeof ArkDialog.Description,
  CloseTrigger: inDrawerScope(
    ArkDialog.CloseTrigger,
    "ModernoDrawerCloseTrigger",
  ) as unknown as typeof ArkDialog.CloseTrigger,
  Context: ArkDialog.Context,
};
