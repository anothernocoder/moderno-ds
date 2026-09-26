<script lang="ts">
  import List from "../../../../registry/blocks/list/svelte/List.svelte";

  type State = "default" | "widths" | "empty" | "loading" | "error" | "disabled";

  let { locale = "en", state = "default" }: { locale?: "en" | "es"; state?: State } = $props();

  const error = {
    en: "We could not load your team.",
    es: "No pudimos cargar tu equipo.",
  }[locale];
</script>

<div class="demo-state" data-demo-state={state}>
  {#if state === "widths"}
    <div class="demo-widths">
      <div data-demo-state="narrow" class="demo-viewport" style="--viewport-width: 18rem" data-label="18rem">
        <List />
      </div>
      <div data-demo-state="panel" class="demo-viewport" style="--viewport-width: 30rem" data-label="30rem">
        <List />
      </div>
      <div data-demo-state="wide" class="demo-viewport" style="--viewport-width: 50rem" data-label="50rem">
        <div class="demo-scroll">
          <div class="demo-wide"><List /></div>
        </div>
      </div>
    </div>
  {:else if state === "empty"}
    <List items={[]} />
  {:else if state === "loading"}
    <List loading />
  {:else if state === "error"}
    <List {error} />
  {:else if state === "disabled"}
    <List disabled />
  {:else}
    <List />
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
