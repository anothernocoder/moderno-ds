/**
 * Dialog — @moderno-ui/react, the same demo every framework's example shows.
 * Two demos, because a dialog has two things worth showing and neither shows
 * the other:
 *
 * 1. The modal itself, via a real trigger. Ark portals the content, traps
 *    focus, locks scroll and restores focus on close. The trigger renders
 *    through `asChild` so the button is the design system's own `Button`, not
 *    a bare trigger element — the same composition a consumer writes.
 * 2. The surface, inline. The dialog's content is what components.css
 *    actually paints, and none of it is on screen while the modal is closed —
 *    so the docs page would guard nothing without it. The second demo is the
 *    same parts held open non-modally and rendered in place instead of
 *    through the portal.
 */
import { Button, Dialog, Portal } from "@moderno-ui/react";

export function DialogDemo() {
  return (
    <div className="demo-dialog">
      <div className="demo-row">
        <Dialog.Root>
          <Dialog.Trigger asChild>
            <Button variant="destructive">Delete project</Button>
          </Dialog.Trigger>
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Title>Delete project</Dialog.Title>
                <Dialog.Description>
                  This permanently removes the project and everything in it. This cannot be undone.
                </Dialog.Description>
                <div className="demo-row demo-row--end">
                  <Dialog.CloseTrigger asChild>
                    <Button variant="outline">Cancel</Button>
                  </Dialog.CloseTrigger>
                  <Dialog.CloseTrigger asChild>
                    <Button variant="destructive">Delete</Button>
                  </Dialog.CloseTrigger>
                </div>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      </div>

      <figure className="demo-inline">
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
              <div className="demo-row demo-row--end">
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
