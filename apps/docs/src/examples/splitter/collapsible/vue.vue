<script setup lang="ts">
import { Splitter } from "@moderno-ui/vue";
</script>

<template>
  <Splitter.Root
    :panels="[
      { id: 'sidebar', minSize: 20, collapsible: true },
      { id: 'main', minSize: 40 },
    ]"
    :default-size="[30, 70]"
  >
    <Splitter.Panel id="sidebar">Sidebar</Splitter.Panel>
    <Splitter.ResizeTrigger id="sidebar:main" aria-label="Resize sidebar and main">
      <Splitter.ResizeTriggerIndicator />
    </Splitter.ResizeTrigger>
    <Splitter.Panel id="main">Main</Splitter.Panel>
  </Splitter.Root>
</template>
