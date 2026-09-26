<!--
  Callout — CSS-only; the note role and the optional icon serialise, at two
  statuses.
-->
<script lang="ts">
  import { Callout } from "../../src/exports/callout.js";
  import type { SectionProps } from "../section.js";

  let {}: SectionProps = $props();
</script>

<section aria-label="callouts">
  <Callout.Root>
    <Callout.Icon>i</Callout.Icon>
    <Callout.Content>
      <Callout.Title>Good to know</Callout.Title>
      <Callout.Description>Exports run overnight.</Callout.Description>
    </Callout.Content>
  </Callout.Root>
  <Callout.Root variant="warning">
    <Callout.Content>
      <Callout.Description>Renaming a workspace breaks old links.</Callout.Description>
    </Callout.Content>
  </Callout.Root>
</section>
