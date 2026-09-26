<script setup lang="ts">
import { Skeleton } from "@moderno-ui/vue";
</script>

<template>
  <div class="demo-media" aria-busy="true">
    <Skeleton shape="circle" />
    <div class="demo-stack">
      <Skeleton />
      <Skeleton style="width: 60%" />
    </div>
  </div>
</template>
