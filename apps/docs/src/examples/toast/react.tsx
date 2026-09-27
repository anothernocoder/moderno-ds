import { Button, Toast, Toaster, createToaster } from "@moderno-ui/react";

const toaster = createToaster({ placement: "bottom-end" });

export function ToastDemo() {
  return (
    <>
      <Button
        onClick={() =>
          toaster.create({ title: "Changes saved", description: "Your profile is up to date." })
        }
      >
        Save changes
      </Button>
      <Toaster toaster={toaster}>
        {(toast) => (
          <Toast.Root>
            <Toast.Title>{toast.title}</Toast.Title>
            <Toast.Description>{toast.description}</Toast.Description>
            <Toast.CloseTrigger>×</Toast.CloseTrigger>
          </Toast.Root>
        )}
      </Toaster>
    </>
  );
}
