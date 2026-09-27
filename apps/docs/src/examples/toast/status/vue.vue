<script setup lang="ts">
import { Button, Toast, Toaster, createToaster } from "@moderno-ui/vue";

const toaster = createToaster({ placement: "top-end" });
</script>

<template>
  <div class="demo-row">
    <Button variant="outline" @click="toaster.success({ title: 'Payment received' })">
      Success
    </Button>
    <Button variant="outline" @click="toaster.error({ title: 'Upload failed' })">Error</Button>
    <Button variant="outline" @click="toaster.warning({ title: 'Storage almost full' })">
      Warning
    </Button>
    <Button variant="outline" @click="toaster.info({ title: 'New version available' })">
      Info
    </Button>
    <Toaster v-slot="toast" :toaster="toaster">
      <Toast.Root>
        <Toast.Title>{{ toast.title }}</Toast.Title>
      </Toast.Root>
    </Toaster>
  </div>
</template>
