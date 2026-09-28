<script setup lang="ts">
import { FileUpload } from "@moderno-ui/vue";
</script>

<template>
  <FileUpload label="Upload logo" :accept="['image/svg+xml', 'image/png']" disabled />
</template>
