<script lang="ts">
  import { Alert } from "../../src/index.js";
  import type { AlertSize, AlertVariant } from "../../src/index.js";

  let {
    variant,
    size,
    role,
    ariaLabel,
  }: {
    variant?: AlertVariant;
    size?: AlertSize;
    role?: string;
    ariaLabel?: string;
  } = $props();
</script>

<Alert.Root {variant} {size} {role} aria-label={ariaLabel}>
  <Alert.Icon>i</Alert.Icon>
  <Alert.Content>
    <Alert.Title>Trial ending</Alert.Title>
    <Alert.Description>Three days left.</Alert.Description>
    <Alert.Action>
      <button type="button">Manage plan</button>
    </Alert.Action>
  </Alert.Content>
</Alert.Root>
