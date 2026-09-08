/** @jsxImportSource solid-js */
/**
 * Dialog — @moderno-ui/solid, the same demo every framework's example shows.
 * Two demos, because a dialog has two things worth showing and neither shows
 * the other: the real modal, triggered through `asChild` so the button is the
 * design system's own `Button`; and the same content surface held open and
 * rendered in place, since none of it is on screen while the modal is closed.
 *
 * See examples/button/solid.tsx for why the pragma above is required.
 */
import { Button, Dialog, Portal } from "@moderno-ui/solid";

export function DialogDemo() {
  return (
    <div class="demo-dialog">
      <div class="demo-row">
        <Dialog.Root>
          <Dialog.Trigger
            asChild={(triggerProps) => (
              <Button {...triggerProps()} variant="destructive">
                Delete project
              </Button>
            )}
          ></Dialog.Trigger>
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Title>Delete project</Dialog.Title>
                <Dialog.Description>
                  This permanently removes the project and everything in it. This cannot be undone.
                </Dialog.Description>
                <div class="demo-row demo-row--end">
                  <Dialog.CloseTrigger
                    asChild={(closeProps) => (
                      <Button {...closeProps()} variant="outline">
                        Cancel
                      </Button>
                    )}
                  ></Dialog.CloseTrigger>
                  <Dialog.CloseTrigger
                    asChild={(closeProps) => (
                      <Button {...closeProps()} variant="destructive">
                        Delete
                      </Button>
                    )}
                  ></Dialog.CloseTrigger>
                </div>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      </div>

      <figure class="demo-inline">
        <Dialog.Root
          open
          modal={false}
          trapFocus={false}
          preventScroll={false}
          closeOnEscape={false}
          closeOnInteractOutside={false}
        >
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Title>Delete project</Dialog.Title>
              <Dialog.Description>
                This permanently removes the project and everything in it. This cannot be undone.
              </Dialog.Description>
              <div class="demo-row demo-row--end">
                <Button variant="outline">Cancel</Button>
                <Button variant="destructive">Delete</Button>
              </div>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
        <figcaption>
          The same content surface, held open and rendered in place — no portal, no focus trap, no
          scroll lock.
        </figcaption>
      </figure>
    </div>
  );
}
