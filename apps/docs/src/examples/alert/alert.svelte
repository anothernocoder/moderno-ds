<!--
  One info Alert with an icon, a title and a description —
  @moderno-ui/svelte. The icon is inline SVG: primitives stay
  icon-agnostic, and the glyph strokes `currentColor`, which the `icon`
  part sets from the status hue.

  This file is the Example the docs page shows *and* mounts (CONTEXT.md
  "Example"), so the source under the live demo cannot drift from it.
-->
<script lang="ts">
  import { Alert } from "@moderno-ui/svelte";
</script>

<Alert.Root variant="info">
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
    <Alert.Title>Trial ending soon</Alert.Title>
    <Alert.Description>Your workspace switches to the free plan in three days.</Alert.Description>
  </Alert.Content>
</Alert.Root>
