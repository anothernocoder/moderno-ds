/** @jsxImportSource solid-js */
import { createSignal } from "solid-js";
import { Button, Dialog, Portal } from "@moderno-ui/solid";

export function DialogControlledDemo() {
  const [open, setOpen] = createSignal(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Show shortcuts
      </Button>
      <Dialog.Root open={open()} onOpenChange={(details) => setOpen(details.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Title>Keyboard shortcuts</Dialog.Title>
              <Dialog.Description>
                Press ⌘K to search and Esc to close any dialog.
              </Dialog.Description>
              <div class="demo-row">
                <Button onClick={() => setOpen(false)}>Got it</Button>
              </div>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
}
