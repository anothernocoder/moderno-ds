<!--
  Alert — CSS-only; the anatomy and the role resolved from the status
  ("info" reports politely, "error" interrupts) serialise, with and without
  an action.
-->
<script lang="ts">
  import { Alert } from "../../src/exports/alert.js";
  import { Button } from "../../src/exports/button.js";
  import type { SectionProps } from "../section.js";

  let {}: SectionProps = $props();
</script>

<section aria-label="alerts">
  <Alert.Root variant="info">
    <Alert.Icon>i</Alert.Icon>
    <Alert.Content>
      <Alert.Title>Heads up</Alert.Title>
      <Alert.Description>Your trial ends in three days.</Alert.Description>
      <Alert.Action>
        <Button size="sm" variant="outline">Manage plan</Button>
      </Alert.Action>
    </Alert.Content>
  </Alert.Root>
  <Alert.Root variant="error" size="sm">
    <Alert.Icon>!</Alert.Icon>
    <Alert.Content>
      <Alert.Title>Payment failed</Alert.Title>
      <Alert.Description>We could not charge your card.</Alert.Description>
    </Alert.Content>
  </Alert.Root>
</section>
