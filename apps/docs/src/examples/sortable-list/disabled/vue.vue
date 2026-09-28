<script setup lang="ts">
import { ref } from "vue";
import { SortableList } from "@moderno-ui/vue";

const slides = ref(["Cover", "Logo", "Colors", "Fonts"]);
</script>

<template>
  <SortableList.Root v-model:items="slides" aria-label="Slides">
    <SortableList.Item
      v-for="slide in slides"
      :key="slide"
      :value="slide"
      :disabled="slide === 'Cover'"
    >
      <SortableList.ItemHandle />
      <SortableList.ItemTrigger>{{ slide }}</SortableList.ItemTrigger>
    </SortableList.Item>
  </SortableList.Root>
</template>
