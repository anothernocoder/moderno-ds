<script setup lang="ts">
import { Button, Toast, Toaster, createToaster } from "@moderno-ui/vue";

const toaster = createToaster({ placement: "bottom" });

function archive() {
  toaster.create({
    title: "Message archived",
    action: { label: "Undo", onClick: () => toaster.create({ title: "Message restored" }) },
  });
}
</script>

<template>
  <Button variant="outline" @click="archive">Archive</Button>
  <Toaster v-slot="toast" :toaster="toaster">
    <Toast.Root>
      <Toast.Title>{{ toast.title }}</Toast.Title>
      <Toast.ActionTrigger v-if="toast.action">{{ toast.action.label }}</Toast.ActionTrigger>
    </Toast.Root>
  </Toaster>
</template>
