<script setup lang="ts">
import { Splitter } from "@moderno-ui/vue";
</script>

<template>
  <Splitter.Root
    variant="enclosed"
    :panels="[
      { id: 'files', minSize: 20 },
      { id: 'editor', minSize: 30 },
    ]"
    :default-size="[30, 70]"
  >
    <Splitter.Panel id="files">Files</Splitter.Panel>
    <Splitter.ResizeTrigger id="files:editor" aria-label="Resize files and editor">
      <Splitter.ResizeTriggerIndicator />
    </Splitter.ResizeTrigger>
    <Splitter.Panel id="editor">Editor</Splitter.Panel>
  </Splitter.Root>
</template>
