/** @jsxImportSource solid-js */
import { Button, Toast, Toaster, createToaster } from "@moderno-ui/solid";

const toaster = createToaster({ placement: "top" });

export function ToastPlacementDemo() {
  return (
    <>
      <Button variant="outline" onClick={() => toaster.create({ title: "Shown at the top" })}>
        Show at the top
      </Button>
      <Toaster toaster={toaster}>
        {(toast) => (
          <Toast.Root>
            <Toast.Title>{toast().title}</Toast.Title>
          </Toast.Root>
        )}
      </Toaster>
    </>
  );
}
