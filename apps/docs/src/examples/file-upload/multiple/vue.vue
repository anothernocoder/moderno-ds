<script setup lang="ts">
import { FileUpload } from "@moderno-ui/vue";
</script>

<template>
  <FileUpload label="Upload fonts" :accept="['.otf', '.ttf', '.woff2']" :max-files="4" />
</template>
