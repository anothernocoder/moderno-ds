/** @jsxImportSource solid-js */
import { For } from "solid-js";
import { Button, Toast, Toaster, createToaster, type ToastSize } from "@moderno-ui/solid";

const toaster = createToaster({ placement: "bottom-start" });
const sizes: ToastSize[] = ["sm", "md", "lg"];

export function ToastSizesDemo() {
  return (
    <div class="demo-row">
      <For each={sizes}>
        {(size) => (
          <Button
            variant="outline"
            onClick={() =>
              toaster.create({ title: `Size ${size}`, description: "Draft saved.", meta: { size } })
            }
          >
            {size}
          </Button>
        )}
      </For>
      <Toaster toaster={toaster}>
        {(toast) => (
          <Toast.Root size={toast().meta?.size}>
            <Toast.Title>{toast().title}</Toast.Title>
            <Toast.Description>{toast().description}</Toast.Description>
          </Toast.Root>
        )}
      </Toaster>
    </div>
  );
}
