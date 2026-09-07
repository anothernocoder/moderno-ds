<!--
  Live Card preview — the real @moderno-ui/svelte primitive across its surface
  variants. Hydrated as an island; painted by @moderno-ui/css from the active
  theme, so it re-skins live with the Theme Builder and the color-scheme toggle.
-->
<script lang="ts">
  import { Button, Card } from "@moderno-ui/svelte";

  const variants = [
    {
      variant: "outline",
      title: "Outline",
      description: "The default surface: card fill, 1px border.",
    },
    { variant: "muted", title: "Muted", description: "A recessed well for secondary content." },
    { variant: "ghost", title: "Ghost", description: "The anatomy's rhythm with no surface." },
  ] as const;
</script>

<div class="demo-grid">
  {#each variants as item (item.variant)}
    <Card.Root variant={item.variant}>
      <Card.Header>
        <Card.Title>{item.title}</Card.Title>
        <Card.Description>{item.description}</Card.Description>
      </Card.Header>
      <Card.Content>Up 12% on last month.</Card.Content>
      <Card.Footer>
        <Button variant="outline" size="sm">Export</Button>
      </Card.Footer>
    </Card.Root>
  {/each}
</div>
