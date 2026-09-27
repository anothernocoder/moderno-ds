<script setup lang="ts">
import { FileUpload } from "@moderno-ui/vue";
</script>

<template>
  <FileUpload
    label="Upload logo"
    :accept="['image/svg+xml', 'image/png']"
    :max-file-size="2_000_000"
  />
</template>
