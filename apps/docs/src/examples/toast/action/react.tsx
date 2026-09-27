import { Button, Toast, Toaster, createToaster } from "@moderno-ui/react";

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
            <Toast.Title>{toast.title}</Toast.Title>
            {toast.action && <Toast.ActionTrigger>{toast.action.label}</Toast.ActionTrigger>}
          </Toast.Root>
        )}
      </Toaster>
    </>
  );
}
