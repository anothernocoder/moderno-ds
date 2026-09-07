<!--
  The full Card anatomy, so each test can assert one part of the same tree.
  Svelte components take props, not JSX children, so the tree lives here.
-->
<script lang="ts">
  import { Card } from "../../src/index.js";
  import type { CardSize, CardVariant } from "@moderno-ui/core";

  let {
    variant,
    size,
    ariaLabel,
    onclick,
  }: {
    variant?: CardVariant;
    size?: CardSize;
    ariaLabel?: string;
    onclick?: (event: MouseEvent) => void;
  } = $props();
</script>

<Card.Root {variant} {size} aria-label={ariaLabel} {onclick} data-testid="root">
  <Card.Header data-testid="header">
    <Card.Title>Monthly report</Card.Title>
    <Card.Description>Revenue across every channel.</Card.Description>
  </Card.Header>
  <Card.Content data-testid="content">Up 12% on last month.</Card.Content>
  <Card.Footer data-testid="footer">Export</Card.Footer>
</Card.Root>
