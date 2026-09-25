<script setup lang="ts">
import { Callout } from "@moderno-ui/vue";
</script>

<template>
  <div class="demo-stack">
    <Callout.Root variant="info">
      <Callout.Content>
        <Callout.Title>Good to know</Callout.Title>
        <Callout.Description>Exports run overnight.</Callout.Description>
      </Callout.Content>
    </Callout.Root>
    <Callout.Root variant="success">
      <Callout.Content>
        <Callout.Title>Nice work</Callout.Title>
        <Callout.Description>Your workspace is ready to share.</Callout.Description>
      </Callout.Content>
    </Callout.Root>
    <Callout.Root variant="warning">
      <Callout.Content>
        <Callout.Title>Heads up</Callout.Title>
        <Callout.Description>Renaming a workspace breaks old links.</Callout.Description>
      </Callout.Content>
    </Callout.Root>
    <Callout.Root variant="error">
      <Callout.Content>
        <Callout.Title>Careful</Callout.Title>
        <Callout.Description>Deleting a project cannot be undone.</Callout.Description>
      </Callout.Content>
    </Callout.Root>
  </div>
</template>
