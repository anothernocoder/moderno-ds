import { Toast as ArkToast } from "@ark-ui/svelte";
import ToastRoot from "../ToastRoot.svelte";

/**
 * Toast — a short message that appears over the page for a few seconds and
 * goes away on its own. Ark drives it: `createToaster({ placement, … })`
 * makes a store you call from anywhere (`toaster.create`, `.success`,
 * `.error`, `.dismiss`, …), and `<Toaster {toaster}>` renders its live
 * region and one toast per entry, through its `children` snippet (it
 * receives each toast as an accessor). Each toast is a `role="status"`
 * labelled by its title and described by its description; it pauses while
 * hovered or focused, and Escape dismisses it. `Root` takes the `size`
 * recipe; every other part is Ark's verbatim. Annotated so the emitted
 * `.d.ts` doesn't inline an un-nameable `@zag-js` type (TS2742).
 */
export const Toast: Omit<typeof ArkToast, "Root"> & { Root: typeof ToastRoot } = {
  ...ArkToast,
  Root: ToastRoot,
};
export { Toaster, createToaster } from "@ark-ui/svelte";
export type { ToastSize } from "@moderno-ui/core";
export type {
  ToastOptions,
  ToastPlacement,
  ToastType,
  ToastActionOptions,
  ToastPromiseOptions,
  ToastStatusChangeDetails,
  CreateToasterProps,
  CreateToasterReturn,
} from "@ark-ui/svelte";
