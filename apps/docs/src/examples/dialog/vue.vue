<!--
  Dialog — @moderno-ui/vue, the same demo every framework's example shows. Two
  demos, because a dialog has two things worth showing and neither shows the
  other: the real modal, triggered through `as-child` so the button is the
  design system's own `Button`; and the same content surface held open and
  rendered in place, since none of it is on screen while the modal is closed.
-->
<script setup lang="ts">
import { Button, Dialog, Portal } from "@moderno-ui/vue";
</script>

<template>
  <div class="demo-dialog">
    <div class="demo-row">
      <Dialog.Root>
        <Dialog.Trigger as-child>
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
              <div class="demo-row demo-row--end">
                <Dialog.CloseTrigger as-child>
                  <Button variant="outline">Cancel</Button>
                </Dialog.CloseTrigger>
                <Dialog.CloseTrigger as-child>
                  <Button variant="destructive">Delete</Button>
                </Dialog.CloseTrigger>
              </div>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </div>

    <figure class="demo-inline">
      <Dialog.Root
        :open="true"
        :modal="false"
        :trap-focus="false"
        :prevent-scroll="false"
        :close-on-escape="false"
        :close-on-interact-outside="false"
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
</template>
