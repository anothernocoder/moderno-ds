import type { Ref } from "react";
import { Toast as ArkToast } from "@ark-ui/react";
import type { ToastRootProps } from "@ark-ui/react";
import { toastRecipe, type ToastSize } from "@moderno-ui/core";

export type { ToastSize } from "@moderno-ui/core";

export interface ModernoToastRootProps extends ToastRootProps {
  /** Density of the toast — resolves to `data-size` on the root part. */
  size?: ToastSize;
}

/**
 * Toast.Root with the Moderno `size` recipe folded in. Ark's Root spreads
 * unknown props onto its `data-part="root"` element, so the recipe's
 * attribute rides along and `components.css` styles the toast from it. A
 * ref passes through with the other props (React 19).
 */
function ToastRoot({ size, ...props }: ModernoToastRootProps & { ref?: Ref<HTMLDivElement> }) {
  return <ArkToast.Root {...props} {...toastRecipe({ size })} />;
}

/**
 * Toast — a short message that appears over the page for a few seconds and
 * goes away on its own.
 *
 * Ark drives it: `createToaster({ placement, … })` makes a store you call
 * from anywhere (`toaster.create`, `.success`, `.error`, `.dismiss`, …), and
 * `<Toaster toaster={toaster}>` renders its live region and one toast per
 * entry, through the render function you pass. Each toast is a
 * `role="status"` labelled by its title and described by its description;
 * it pauses while hovered or focused, and Escape dismisses it. Anatomy:
 * `Toaster (group) > Root > Title, Description, ActionTrigger,
 * CloseTrigger`. `Root` takes the `size` recipe; every other part is Ark's
 * verbatim. The object is annotated so the emitted `.d.ts` doesn't inline an
 * un-nameable `@zag-js` type (TS2742).
 */
export const Toast: Omit<typeof ArkToast, "Root"> & { Root: typeof ToastRoot } = {
  ...ArkToast,
  Root: ToastRoot,
};

export { Toaster, createToaster } from "@ark-ui/react";

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
} from "@ark-ui/react";
