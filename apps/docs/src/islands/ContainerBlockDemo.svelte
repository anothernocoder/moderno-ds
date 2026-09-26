<script lang="ts">
  import { Card } from "@moderno-ui/svelte";
  import Container from "../../../../registry/blocks/container/svelte/Container.svelte";

  type State = "default" | "sizes" | "widths" | "content";

  let { locale = "en", state = "default" }: { locale?: "en" | "es"; state?: State } = $props();

  const copy = {
    en: {
      title: "Your page",
      description: "Anything you pass in sits in the middle, at the width you picked.",
    },
    es: {
      title: "Tu página",
      description: "Lo que pongas dentro queda en el centro, al ancho que elegiste.",
    },
  }[locale];

  const sizes = ["sm", "md", "lg", "full"] as const;
</script>

<div class="demo-state" data-demo-state={state}>
  {#if state === "sizes"}
    <div class="demo-widths">
      {#each sizes as size (size)}
        <div data-demo-state={size} class="demo-viewport" data-label={size}>
          <Container {size} />
        </div>
      {/each}
    </div>
  {:else if state === "widths"}
    <div class="demo-widths">
      <div data-demo-state="narrow" class="demo-viewport" style="--viewport-width: 18rem" data-label="18rem">
        <Container />
      </div>
      <div data-demo-state="panel" class="demo-viewport" style="--viewport-width: 30rem" data-label="30rem">
        <Container />
      </div>
      <div data-demo-state="wide" class="demo-viewport" style="--viewport-width: 50rem" data-label="50rem">
        <div class="demo-scroll">
          <div class="demo-wide"><Container /></div>
        </div>
      </div>
    </div>
  {:else if state === "content"}
    <Container size="md">
      <Card.Root variant="muted">
        <Card.Header>
          <Card.Title>{copy.title}</Card.Title>
          <Card.Description>{copy.description}</Card.Description>
        </Card.Header>
      </Card.Root>
    </Container>
  {:else}
    <Container />
  {/if}
</div>

<style>
  /* `minmax(0, 1fr)`, not the implicit `auto`: an auto track grows to its
     items' min-content, and the 50rem stage would widen the track past the
     panel instead of scrolling inside its own frame. */
  .demo-widths {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 2.5rem;
  }
  /* The width is the demo's, not the design system's: the block sizes only
     from contract slots. */
  .demo-scroll {
    overflow-x: auto;
  }
  .demo-wide {
    width: 50rem;
  }
</style>
