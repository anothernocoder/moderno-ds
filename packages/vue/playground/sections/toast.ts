/**
 * Toast — Ark's toast group machine: the Toaster renders its live region,
 * named after the toaster's placement, on the server. Toasts only arrive
 * once a client calls the toaster, so the server string holds the empty
 * region and the slot each toast would go through. A section has no toast
 * to open, so it ignores `open`.
 */
import { h } from "vue";
import { Toast, Toaster, createToaster, type ToastOptions } from "../../src/toast.js";
import type { Section } from "../section.js";

const toaster = createToaster({ placement: "bottom-end" });

const ToastSection: Section = () =>
  h("section", { "aria-label": "toast" }, [
    h(
      Toaster,
      { toaster },
      {
        default: (toast: ToastOptions) =>
          h(Toast.Root, { size: "sm" }, () => [
            h(Toast.Title, {}, () => toast.title),
            h(Toast.Description, {}, () => toast.description),
            h(Toast.CloseTrigger, { "aria-label": "Dismiss" }, () => "×"),
          ]),
      },
    ),
  ]);

export default ToastSection;
