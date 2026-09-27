<script setup lang="ts">
import { Button, Toast, Toaster, createToaster } from "@moderno-ui/vue";

const toaster = createToaster({ placement: "top" });
</script>

<template>
  <Button variant="outline" @click="toaster.create({ title: 'Shown at the top' })">
    Show at the top
  </Button>
  <Toaster v-slot="toast" :toaster="toaster">
    <Toast.Root>
      <Toast.Title>{{ toast.title }}</Toast.Title>
    </Toast.Root>
  </Toaster>
</template>
