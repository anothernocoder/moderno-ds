<script lang="ts">
  import type { Snippet } from "svelte";
  import { Card } from "@moderno-ui/svelte";

  type ContainerSize = "sm" | "md" | "lg" | "full";

  interface Props {
    size?: ContainerSize;
    children?: Snippet;
  }

  let { size = "lg", children }: Props = $props();
</script>

<div class="@container moderno-block-container w-full text-foreground">
  <div
    data-size={size}
    class="mx-auto w-full px-4 py-6 data-[size=lg]:max-w-lg data-[size=md]:max-w-md data-[size=sm]:max-w-sm @sm:px-6 @md:px-8 @lg:py-10"
  >
    {#if children}
      {@render children()}
    {:else}
      <Card.Root>
        <Card.Header>
          <Card.Title>Page content</Card.Title>
          <Card.Description>
            The container centres this card and keeps the same gutter on both sides.
          </Card.Description>
        </Card.Header>
      </Card.Root>
    {/if}
  </div>
</div>
