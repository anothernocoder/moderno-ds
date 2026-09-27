/** @jsxImportSource solid-js */
import { Button, Toast, Toaster, createToaster } from "@moderno-ui/solid";

const toaster = createToaster({ placement: "top-end" });

export function ToastStatusDemo() {
  return (
    <div class="demo-row">
      <Button variant="outline" onClick={() => toaster.success({ title: "Payment received" })}>
        Success
      </Button>
      <Button variant="outline" onClick={() => toaster.error({ title: "Upload failed" })}>
        Error
      </Button>
      <Button variant="outline" onClick={() => toaster.warning({ title: "Storage almost full" })}>
        Warning
      </Button>
      <Button variant="outline" onClick={() => toaster.info({ title: "New version available" })}>
        Info
      </Button>
      <Toaster toaster={toaster}>
        {(toast) => (
          <Toast.Root>
            <Toast.Title>{toast().title}</Toast.Title>
          </Toast.Root>
        )}
      </Toaster>
    </div>
  );
}
