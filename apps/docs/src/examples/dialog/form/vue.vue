<!--
  A Dialog holding a short form. With no role override Ark focuses the first
  focusable element in the content on open — here the input — @moderno-
  ui/vue.
-->
<script setup lang="ts">
import { Button, Dialog, Field, Portal } from "@moderno-ui/vue";
</script>

<template>
  <Dialog.Root>
    <Dialog.Trigger as-child>
      <Button variant="outline">Rename project</Button>
    </Dialog.Trigger>
    <Portal>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Title>Rename project</Dialog.Title>
          <Dialog.Description>
            The new name shows in the sidebar and in every link to the project.
          </Dialog.Description>
          <Field.Root>
            <Field.Label>Project name</Field.Label>
            <Field.Input value="Moderno" />
          </Field.Root>
          <div class="demo-row">
            <Dialog.CloseTrigger as-child>
              <Button variant="outline">Cancel</Button>
            </Dialog.CloseTrigger>
            <Dialog.CloseTrigger as-child>
              <Button>Save</Button>
            </Dialog.CloseTrigger>
          </div>
        </Dialog.Content>
      </Dialog.Positioner>
    </Portal>
  </Dialog.Root>
</template>
