/**
 * Toast — Ark's toast group machine: the Toaster renders its live region,
 * named after the toaster's placement, on the server. Toasts only arrive
 * once a client calls the toaster, so the server string holds the empty
 * region and the render function each toast would go through. A section
 * has no toast to open, so it ignores `open`.
 */
import { Toast, Toaster, createToaster } from "../../src/toast.js";
import type { Section } from "../section.js";

const toaster = createToaster({ placement: "bottom-end" });

const ToastSection: Section = () => (
  <section aria-label="toast">
    <Toaster toaster={toaster}>
      {(toast) => (
        <Toast.Root size="sm">
          <Toast.Title>{toast.title}</Toast.Title>
          <Toast.Description>{toast.description}</Toast.Description>
          <Toast.CloseTrigger aria-label="Dismiss">×</Toast.CloseTrigger>
        </Toast.Root>
      )}
    </Toaster>
  </section>
);

export default ToastSection;
