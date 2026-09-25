<script lang="ts">
  import { Alert } from "@moderno-ui/svelte";
</script>

{#snippet circleIcon(path: string)}
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
    <path d={path} />
  </svg>
{/snippet}

<div class="demo-stack">
  <Alert.Root variant="info">
    <Alert.Icon>{@render circleIcon("M12 16v-4M12 8h.01")}</Alert.Icon>
    <Alert.Content>
      <Alert.Title>Trial ending soon</Alert.Title>
      <Alert.Description>Your workspace switches to the free plan in three days.</Alert.Description>
    </Alert.Content>
  </Alert.Root>

  <Alert.Root variant="success">
    <Alert.Icon>{@render circleIcon("m8 12 2.5 2.5L16 9")}</Alert.Icon>
    <Alert.Content>
      <Alert.Title>Invoice sent</Alert.Title>
      <Alert.Description>Acme Inc. was notified by email.</Alert.Description>
    </Alert.Content>
  </Alert.Root>

  <Alert.Root variant="warning">
    <Alert.Icon>{@render circleIcon("M12 8v4M12 16h.01")}</Alert.Icon>
    <Alert.Content>
      <Alert.Title>Card expiring</Alert.Title>
      <Alert.Description>The card ending 4242 expires next month.</Alert.Description>
    </Alert.Content>
  </Alert.Root>

  <Alert.Root variant="error">
    <Alert.Icon>{@render circleIcon("m15 9-6 6M9 9l6 6")}</Alert.Icon>
    <Alert.Content>
      <Alert.Title>Payment failed</Alert.Title>
      <Alert.Description>We could not charge your card.</Alert.Description>
    </Alert.Content>
  </Alert.Root>
</div>
