import { defineComponent, h, type Component, type DefineComponent, type PropType } from "vue";
import { Toast as ArkToast } from "@ark-ui/vue";
import type { ToastRootProps } from "@ark-ui/vue";
import { toastRecipe, type ToastSize } from "@moderno-ui/core";

export type { ToastSize } from "@moderno-ui/core";

/** The Root's public surface: Ark's own props plus the Moderno `size` recipe. */
export interface ModernoToastRootProps extends ToastRootProps {
  /** Density of the toast — resolves to `data-size` on the root part. */
  size?: ToastSize;
}

/**
 * Toast.Root with the Moderno `size` recipe folded in. Ark's Root spreads
 * unknown attributes onto its `data-part="root"` element, so the recipe's
 * attribute rides along and `components.css` styles the toast from it.
 * `asChild`, `class` and every other attribute pass straight through.
 */
const ToastRootImpl = defineComponent({
  name: "ModernoToastRoot",
  inheritAttrs: false,
  props: {
    size: { type: String as PropType<ToastSize>, default: undefined },
  },
  setup(props, { slots, attrs }) {
    // Ark's Root re-typed as a plain Component so the merged bag isn't checked
    // against its full prop union (we only add the recipe's data-*).
    const Root = ArkToast.Root as unknown as Component;
    return () => h(Root, { ...attrs, ...toastRecipe({ size: props.size }) }, slots);
  },
});

/**
 * Toast — a short message that appears over the page for a few seconds and
 * goes away on its own. Ark drives it: `createToaster({ placement, … })`
 * makes a store you call from anywhere (`toaster.create`, `.success`,
 * `.error`, `.dismiss`, …), and `<Toaster :toaster="toaster">` renders its
 * live region and one toast per entry, through its default slot. Each toast
 * is a `role="status"` labelled by its title and described by its
 * description; it pauses while hovered or focused, and Escape dismisses it.
 * `Root` takes the `size` recipe; every other part is Ark's verbatim.
 *
 * The whole object is annotated explicitly so the emitted `.d.ts` doesn't
 * inline an un-nameable type that points at internal `@zag-js` paths (TS2742).
 */
export const Toast: Omit<typeof ArkToast, "Root"> & {
  Root: DefineComponent<ModernoToastRootProps>;
} = {
  ...ArkToast,
  Root: ToastRootImpl as unknown as DefineComponent<ModernoToastRootProps>,
};

export { Toaster, createToaster } from "@ark-ui/vue";

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
} from "@ark-ui/vue";
