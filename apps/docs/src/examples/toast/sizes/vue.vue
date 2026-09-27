<script setup lang="ts">
import { Button, Toast, Toaster, createToaster, type ToastSize } from "@moderno-ui/vue";

const toaster = createToaster({ placement: "bottom-start" });
const sizes: ToastSize[] = ["sm", "md", "lg"];
</script>

<template>
  <div class="demo-row">
    <Button
      v-for="size in sizes"
      :key="size"
      variant="outline"
      @click="
        toaster.create({ title: `Size ${size}`, description: 'Draft saved.', meta: { size } })
      "
    >
      {{ size }}
    </Button>
    <Toaster v-slot="toast" :toaster="toaster">
      <Toast.Root :size="toast.meta?.size">
        <Toast.Title>{{ toast.title }}</Toast.Title>
        <Toast.Description>{{ toast.description }}</Toast.Description>
      </Toast.Root>
    </Toaster>
  </div>
</template>
