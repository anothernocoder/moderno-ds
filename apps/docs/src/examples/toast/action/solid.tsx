/** @jsxImportSource solid-js */
import { Show } from "solid-js";
import { Button, Toast, Toaster, createToaster } from "@moderno-ui/solid";

const toaster = createToaster({ placement: "bottom" });

function archive() {
  toaster.create({
    title: "Message archived",
    action: { label: "Undo", onClick: () => toaster.create({ title: "Message restored" }) },
  });
}

export function ToastActionDemo() {
  return (
    <>
      <Button variant="outline" onClick={archive}>
        Archive
      </Button>
      <Toaster toaster={toaster}>
        {(toast) => (
          <Toast.Root>
            <Toast.Title>{toast().title}</Toast.Title>
            <Show when={toast().action}>
              {(action) => <Toast.ActionTrigger>{action().label}</Toast.ActionTrigger>}
            </Show>
          </Toast.Root>
        )}
      </Toaster>
    </>
  );
}
