import { Button, Toast, Toaster, createToaster, type ToastSize } from "@moderno-ui/react";

const toaster = createToaster({ placement: "bottom-start" });
const sizes: ToastSize[] = ["sm", "md", "lg"];

export function ToastSizesDemo() {
  return (
    <div className="demo-row">
      {sizes.map((size) => (
        <Button
          key={size}
          variant="outline"
          onClick={() =>
            toaster.create({ title: `Size ${size}`, description: "Draft saved.", meta: { size } })
          }
        >
          {size}
        </Button>
      ))}
      <Toaster toaster={toaster}>
        {(toast) => (
          <Toast.Root size={toast.meta?.size}>
            <Toast.Title>{toast.title}</Toast.Title>
            <Toast.Description>{toast.description}</Toast.Description>
          </Toast.Root>
        )}
      </Toaster>
    </div>
  );
}
