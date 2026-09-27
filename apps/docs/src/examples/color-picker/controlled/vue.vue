<script setup lang="ts">
import { ref } from "vue";
import { ColorPicker } from "@moderno-ui/vue";

const color = ref("#1E90FF");
</script>

<template>
  <div class="demo-row">
    <ColorPicker v-model="color" />
    <span :style="{ color }">Aa</span>
  </div>
</template>
