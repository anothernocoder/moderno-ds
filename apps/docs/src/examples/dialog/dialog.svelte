<!--
  Live Dialog preview — the real Dialog + Portal re-exported by
  @moderno-ui/svelte (Ark's, verbatim). Two demos, because a dialog has two
  things worth showing and neither shows the other:

  1. **The modal itself.** A real trigger: Ark portals the content, traps focus,
     locks scroll and restores focus on close. Triggers render through `asChild`
     so the button is the design system's own `Button`, not a bare <button> —
     the same composition a consumer writes.

  2. **The surface, inline.** The dialog's content is what components.css
     actually paints (popover slots, radius, elevation, title/description
     scale), and none of it is on screen while the modal is closed — so the docs
     page, and the visual baseline taken from it, would guard nothing. The
     second demo is the same `Dialog` parts held open non-modally and rendered
     in place instead of through the portal: no focus trap, no scroll lock, no
     backdrop, positioner un-fixed by the local CSS below. Same component, same
     stylesheet; only the presentation container differs.

  This file is the Example the docs page shows *and* mounts (CONTEXT.md
  "Example") — the source below the live demo is this file, raw-imported, so
  it cannot drift from what actually renders.
-->
<script lang="ts">
  import { Button, Dialog, Portal } from "@moderno-ui/svelte";
</script>

<div class="demo-dialog">
  <div class="demo-row">
    <Dialog.Root>
      <Dialog.Trigger>
        {#snippet asChild(triggerProps)}
          <Button variant="destructive" {...triggerProps()}>Delete project</Button>
        {/snippet}
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Title>Delete project</Dialog.Title>
            <Dialog.Description>
              This permanently removes the project and everything in it. This cannot be undone.
            </Dialog.Description>
            <div class="demo-row demo-row--end">
              <Dialog.CloseTrigger>
                {#snippet asChild(closeProps)}
                  <Button variant="outline" {...closeProps()}>Cancel</Button>
                {/snippet}
              </Dialog.CloseTrigger>
              <Dialog.CloseTrigger>
                {#snippet asChild(closeProps)}
                  <Button variant="destructive" {...closeProps()}>Delete</Button>
                {/snippet}
              </Dialog.CloseTrigger>
            </div>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  </div>

  <figure class="demo-inline">
    <Dialog.Root
      open={true}
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
      The same content surface, held open and rendered in place — no portal, no
      focus trap, no scroll lock.
    </figcaption>
  </figure>
</div>

<style>
  .demo-dialog {
    display: grid;
    gap: var(--spacing-6);
  }
  .demo-row--end {
    justify-content: flex-end;
  }

  /* The inline showcase only. `[data-part="positioner"]` is `position: fixed;
     inset: 0` by contract — correct for a modal, wrong for a surface embedded
     in prose — so it is un-fixed here and nowhere else. The content part itself
     is untouched: its border, radius, elevation and token slots are exactly
     what a real dialog renders. */
  .demo-inline {
    margin: 0;
    display: grid;
    gap: var(--spacing-3);
  }
  .demo-inline :global([data-scope="dialog"][data-part="positioner"]) {
    position: static;
    padding: 0;
  }
  .demo-inline figcaption {
    color: var(--muted-foreground);
    font-size: 0.8125rem;
  }
</style>
