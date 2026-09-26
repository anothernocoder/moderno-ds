<script lang="ts">
  import { Callout } from "../../src/index.js";
  import type { CalloutVariant } from "../../src/index.js";

  let {
    variant,
    role,
    ariaLabel,
    id,
    titleClass,
  }: {
    variant?: CalloutVariant;
    role?: string;
    ariaLabel?: string;
    id?: string;
    titleClass?: string;
  } = $props();
</script>

<Callout.Root {variant} {role} {id} aria-label={ariaLabel}>
  <Callout.Icon>i</Callout.Icon>
  <Callout.Content>
    <Callout.Title class={titleClass}>Heads up</Callout.Title>
    <Callout.Description>Exports run overnight.</Callout.Description>
  </Callout.Content>
</Callout.Root>
