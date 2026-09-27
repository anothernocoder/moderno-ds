<script setup lang="ts">
import { Button, Toast, Toaster, createToaster } from "@moderno-ui/vue";

const toaster = createToaster({ placement: "bottom-end" });

function save() {
  toaster.create({ title: "Changes saved", description: "Your profile is up to date." });
}
</script>

<template>
  <Button @click="save">Save changes</Button>
  <Toaster v-slot="toast" :toaster="toaster">
    <Toast.Root>
      <Toast.Title>{{ toast.title }}</Toast.Title>
      <Toast.Description>{{ toast.description }}</Toast.Description>
      <Toast.CloseTrigger>×</Toast.CloseTrigger>
    </Toast.Root>
  </Toaster>
</template>
