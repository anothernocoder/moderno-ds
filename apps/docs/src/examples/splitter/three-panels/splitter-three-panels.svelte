<script lang="ts">
  import { Splitter } from "@moderno-ui/svelte";
</script>

<Splitter.Root
  panels={[{ id: "folders", minSize: 15 }, { id: "messages", minSize: 30 }, { id: "preview", minSize: 15 }]}
  defaultSize={[25, 45, 30]}
>
  <Splitter.Panel id="folders">Folders</Splitter.Panel>
  <Splitter.ResizeTrigger id="folders:messages" aria-label="Resize folders and messages">
    <Splitter.ResizeTriggerIndicator />
  </Splitter.ResizeTrigger>
  <Splitter.Panel id="messages">Messages</Splitter.Panel>
  <Splitter.ResizeTrigger id="messages:preview" aria-label="Resize messages and preview">
    <Splitter.ResizeTriggerIndicator />
  </Splitter.ResizeTrigger>
  <Splitter.Panel id="preview">Preview</Splitter.Panel>
</Splitter.Root>
