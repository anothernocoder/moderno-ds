import { splitProps } from "solid-js";
import { Toast as ArkToast } from "@ark-ui/solid";
import type { ToastRootProps } from "@ark-ui/solid";
import { toastRecipe, type ToastSize } from "@moderno-ui/core";

export type { ToastSize } from "@moderno-ui/core";

export type ModernoToastRootProps = ToastRootProps & {
  /** Density of the toast — resolves to `data-size` on the root part. */
  size?: ToastSize;
};

/**
 * Toast.Root with the Moderno `size` recipe folded in. Ark's Root spreads
 * unknown props onto its `data-part="root"` element, so the recipe's
 * attribute rides along and `components.css` styles the toast from it.
 */
function ToastRoot(props: ModernoToastRootProps) {
  const [local, rest] = splitProps(props, ["size"]);
  return <ArkToast.Root {...rest} {...toastRecipe({ size: local.size })} />;
}

/**
 * Toast — a short message that appears over the page for a few seconds and
 * goes away on its own. Ark drives it: `createToaster({ placement, … })`
 * makes a store you call from anywhere (`toaster.create`, `.success`,
 * `.error`, `.dismiss`, …), and `<Toaster toaster={toaster}>` renders its
 * live region and one toast per entry, through the function you pass (it
 * receives each toast as an accessor). Each toast is a `role="status"`
 * labelled by its title and described by its description; it pauses while
 * hovered or focused, and Escape dismisses it. `Root` takes the `size`
 * recipe; every other part is Ark's verbatim. The object is annotated so the
 * emitted `.d.ts` doesn't inline an un-nameable `@zag-js` type (TS2742).
 */
export const Toast: Omit<typeof ArkToast, "Root"> & { Root: typeof ToastRoot } = {
  ...ArkToast,
  Root: ToastRoot,
};

export { Toaster, createToaster } from "@ark-ui/solid";

export type {
  ToastRootProps,
  ToastTitleProps,
  ToastDescriptionProps,
  ToastActionTriggerProps,
  ToastCloseTriggerProps,
  ToasterProps,
  ToastOptions,
  ToastPlacement,
  ToastType,
  ToastActionOptions,
  ToastPromiseOptions,
  ToastStatusChangeDetails,
  CreateToasterProps,
  CreateToasterReturn,
} from "@ark-ui/solid";
