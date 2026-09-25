<!--
  Alert at its two sizes, stacked — @moderno-ui/vue. The icon is inline
  SVG: primitives stay icon-agnostic, and every glyph strokes
  `currentColor`, which the `icon` part sets from the status hue.
-->
<script setup lang="ts">
import { Alert } from "@moderno-ui/vue";
</script>

<template>
  <div class="demo-stack">
    <Alert.Root variant="info" size="md">
      <Alert.Icon>
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
      </Alert.Icon>
      <Alert.Content>
        <Alert.Title>Medium</Alert.Title>
        <Alert.Description>The default padding and gap.</Alert.Description>
      </Alert.Content>
    </Alert.Root>

    <Alert.Root variant="info" size="sm">
      <Alert.Icon>
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
      </Alert.Icon>
      <Alert.Content>
        <Alert.Title>Small</Alert.Title>
        <Alert.Description>Tighter padding for dense layouts.</Alert.Description>
      </Alert.Content>
    </Alert.Root>
  </div>
</template>
