<script setup lang="ts">
import { ref } from "vue";
import { SortableList } from "@moderno-ui/vue";

const lists = ref({
  sm: ["Cover", "Logo", "Colors"],
  md: ["Cover", "Logo", "Colors"],
  lg: ["Cover", "Logo", "Colors"],
});
</script>

<template>
  <div class="demo-row">
    <SortableList.Root
      v-for="(slides, size) in lists"
      :key="size"
      v-model:items="lists[size]"
      :size="size"
      :aria-label="`Slides, ${size}`"
    >
      <SortableList.Item v-for="slide in slides" :key="slide" :value="slide">
        <SortableList.ItemHandle />
        <SortableList.ItemTrigger>{{ slide }}</SortableList.ItemTrigger>
      </SortableList.Item>
    </SortableList.Root>
  </div>
</template>
