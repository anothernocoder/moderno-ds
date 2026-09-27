<script setup lang="ts">
import { Splitter } from "@moderno-ui/vue";
</script>

<template>
  <Splitter.Root
    orientation="vertical"
    :panels="[
      { id: 'code', minSize: 30 },
      { id: 'console', minSize: 20 },
    ]"
    :default-size="[65, 35]"
  >
    <Splitter.Panel id="code">Code</Splitter.Panel>
    <Splitter.ResizeTrigger id="code:console" aria-label="Resize code and console">
      <Splitter.ResizeTriggerIndicator />
    </Splitter.ResizeTrigger>
    <Splitter.Panel id="console">Console</Splitter.Panel>
  </Splitter.Root>
</template>
